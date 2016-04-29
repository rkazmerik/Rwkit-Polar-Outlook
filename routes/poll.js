var bodyParser = require('body-parser')
var express = require('express');
var data = require("../data");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for detecting current poll in email
router.get('/view', function (req, res) {
    res.render('redirect');
});

//route for getting a poll
router.get('/view/:pollId', function (req, res) {
        var pollId = req.params.pollId;
        var pollObj = {};
        pollObj['preview'] = req.query.mode;
        
        //get the poll
        data.entity.getEntity(pollId, function (resp) {
            pollObj['poll'] = resp;
            
            //get the questions for the poll
            data.question.getQuestionsByEntity(pollId, function (questions) {
                pollObj['questions'] = questions;
                
                //get the answers for the poll
                data.answer.getAnswersByEntity(pollId, function (answers) {
                    pollObj['answers'] = answers;
                    res.render('view', pollObj); 
                });
            })            
        });
});

//route for submitting a response
router.post('/view/:pollId', function (req, res) {
    var responseObj = req.body;
    var pollId = req.params.pollId;
    var user = req.query.user || "admin";
    var answer = req.body.answers.split("|");
    
    responseObj.answerId = answer[1];
    responseObj.responses = [answer[0]];
    
    data.response.createResponses(pollId, responseObj, user, function (resp) {
        //update the poll totals
        data.answer.updateTally(responseObj, "add", function(){
            res.redirect('/donut/'+pollId);  
        });  
    });
});

//show new poll form
router.get('/create', function (req, res) {
    res.render('create');
});

//create a new poll
router.post('/create', function (req, res) {
    data.entity.createEntity(req.body, "Poll", function (resp) {
        var pollId = resp.RowKey._;

        //add a new question
        data.question.createQuestions(pollId, req.body, function (questions) {
            var questionId = questions.RowKey._;
            
            //add new answer(s)
            data.answer.createAnswer(pollId, questionId, req.body, function(){
                res.redirect('view/'+pollId+'?mode=preview');    
            })
        });      
    });
});

//show edit poll form
router.get('/edit/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    var pollObj = {};
            
    data.entity.getEntity(pollId, function (resp) {
         pollObj['poll'] = resp;
            
            //get the questions for the poll
            data.question.getQuestionsByEntity(pollId, function (questions) {
                pollObj['questions'] = questions;
                
                //get the answers for the poll
                data.answer.getAnswersByEntity(pollId, function (answers) {
                    pollObj['answers'] = answers;
                    res.render('edit', pollObj); 
                });
            });   
    });
});

//edit a poll
router.post('/edit/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    
    //update the poll
    data.entity.editEntity(req.body, "Poll", function () {
        
        //update the questions
        data.question.editQuestions(req.body, function(){
            
            //update the answers
            data.answer.editAnswers(req.body, function(){
                res.redirect('/view/'+pollId+'?mode=preview');
            });
        });
    });
});

//route for getting a donut chart
router.get('/donut/:pollId', function (req, res) {
        var pollId = req.params.pollId;
        
        //get the answers for the poll
        data.answer.getAnswersByEntity(pollId, function (answers) {
            res.render('donut', answers); 
        });
});

//route for resetting a poll (delete responses and reset totals)
router.get('/reset/:pollId', function (req, res) {
        var pollId = req.params.pollId;
        var pollObj = {};
        
        data.response.deleteResponsesByEntity(pollId, function (resp) {
            
            //get each answer
            data.answer.getAnswersByEntity(pollId, function (answers) {
                for(i=0; i<answers.body.value.length; i++) {
                    pollObj["answerId"] = answers.body.value[i].RowKey;
                    data.answer.updateTally(pollObj, "reset", function(resp){
                        res.end();        
                    });
                }    
            });
        });
});

module.exports = router;