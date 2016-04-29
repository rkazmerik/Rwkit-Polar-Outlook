var bodyParser = require('body-parser')
var express = require('express');
var data = require("../scripts/data.js");
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
        data.getPoll("Poll", pollId, function (poll) {
            pollObj['poll'] = poll;
            
            //get the questions for the poll
            data.getEntitiesByPoll("Question", pollId, function (questions) {
                pollObj['questions'] = questions;
               
                //get the answers for the poll
                data.getEntitiesByPoll("Answer", pollId, function (answers) {
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
    var answer = req.body.answers.split("|");
    
    responseObj.answer = [answer[0]];
    responseObj.answerId = [answer[1]];
    responseObj.tally = [answer[2]];
    responseObj.colors = [answer[3]];
    
    data.createResponses(pollId, responseObj, "admin", function (resp) {
        //update the answer tally
        data.editAnswers(responseObj, "add", function(){
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
    data.createPoll(req.body, function (resp) {
        var pollId = resp.RowKey._;

        //add a new question
        data.createQuestions(pollId, req.body, function (questions) {
            var questionId = questions.RowKey._;
            
            //add new answer(s)
            data.createAnswers(pollId, questionId, req.body, function(){
                res.redirect('view/'+pollId+'?mode=preview');    
            })
        });      
    });
});

//show edit poll form
router.get('/edit/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    var pollObj = {};
            
    data.getPoll("Poll", pollId, function (resp) {
         pollObj['poll'] = resp;
            
            //get the questions for the poll
            data.getEntitiesByPoll("Question", pollId, function (questions) {
                pollObj['questions'] = questions;
                
                //get the answers for the poll
                data.getEntitiesByPoll("Answer", pollId, function (answers) {
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
    data.editPoll(req.body, function () {
        
        //update the questions
        data.editQuestions(req.body, function(){
            
            //update the answers
            data.editAnswers(req.body, "none", function(){
                res.redirect('/view/'+pollId+'?mode=preview');
            });
        });
    });
});

//route for getting a donut chart
router.get('/donut/:pollId', function (req, res) {
        var pollId = req.params.pollId;
        
        //get the answers for the poll
        data.getEntitiesByPoll("Answer", pollId, function (answers) {
            res.render('donut', answers); 
        });
});

//route for resetting a poll (delete responses and reset totals)
router.get('/reset/:pollId', function (req, res) {
        var pollId = req.params.pollId;
        var pollObj = {};
        
        data.deleteResponsesByEntity(pollId, function (resp) {
            
            //get each answer
            data.getEntitiesByPoll("Answer", pollId, function (answers) {
                for(i=0; i<answers.body.value.length; i++) {
                    pollObj["answerId"] = answers.body.value[i].RowKey;
                    data.editAnswers(pollObj, "reset", function(resp){
                        res.end();        
                    });
                }    
            });
        });
});

module.exports = router;