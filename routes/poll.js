var bodyParser = require('body-parser')
var express = require('express');
var data = require("../data");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for getting all polls
router.get('/', function (req, res) {
    data.entity.getEntities("Poll", function (resp) {
        res.render('poll/polls', resp);
    });
});

//route for getting started with polls
router.get('/start', function (req, res) {
    res.render('poll/start');
});

//route for getting a poll
router.get('/view/:pollId*?', function (req, res) {
        var pollId = req.params.pollId;
        var pollObj = {};
        
        if(req.params[0]) {
            pollObj.mode = 'preview';
        }
        
        //get the poll
        data.entity.getEntity(pollId, function (resp) {
            pollObj['poll'] = resp;
            
            //get the questions for the poll
            data.question.getQuestionsByEntity(pollId, function (questions) {
                pollObj['questions'] = questions;
                
                //get the answers for the poll
                data.answer.getAnswersByEntity(pollId, function (answers) {
                    pollObj['answers'] = answers;
                    res.render('poll/view', pollObj); 
                });
            })            
        });
});

//show new poll form
router.get('/create', function (req, res) {
    res.render('poll/create');
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
                res.redirect('/polls/view/'+pollId);    
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
                    res.render('poll/edit', pollObj); 
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
                res.redirect('/polls/view/'+pollId);
            });
        });
    });
});

//route for deleting a poll
router.get('/delete/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    
        //delete the related questions
        data.question.deleteQuestionsByEntity(pollId, function(){
           
           //delete the related answers
           data.answer.deleteAnswersByEntity(pollId, function (){
               
               //delete related responses
               data.response.deleteResponsesByEntity(pollId, function(){
                   
                   //delete the poll
                   data.entity.deleteEntity(pollId, "Poll", function(){
                        res.redirect('/polls');  
                   });
               });
           });
        });
});

//route for inserting a poll
router.get('/insert/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    
    data.entity.getEntity(pollId, function (resp) {
        res.render('poll/insert', resp);
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
            res.redirect("/polls/chart/"+pollId);  
        });  
    });

});

//route for getting responses for a poll
router.get('/responses/:pollId', function (req, res) {
    data.response.getResponsesByEntity(req.params.pollId, function (resp) {
        res.render('root/responses', resp);
    });
});

//route for getting a chart
router.get('/chart/:pollId*?', function (req, res) {
        var pollId = req.params.pollId;
        var pollObj = {};
        
        if(req.params[0]) {
            pollObj.mode = 'preview';
        }
        
        //get the poll
        data.entity.getEntity(pollId, function (resp) {
            pollObj['poll'] = resp;
            
            //get the questions for the poll
            data.question.getQuestionsByEntity(pollId, function (questions) {
                pollObj['questions'] = questions;
                
                //get the answers for the poll
                data.answer.getAnswersByEntity(pollId, function (answers) {
                    pollObj['answers'] = answers;
                    res.render('charts/donut', pollObj); 
                });
            })            
        });
});

module.exports = router;