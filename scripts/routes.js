var bodyParser = require('body-parser')
var express = require('express');
var app = require("../scripts/app.js");
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
        data.getPoll("Poll", pollId, function (resp) {
            pollObj['poll'] = resp.body.value[0];
            
            //get the questions for the poll
            data.getEntitiesByPoll("Question", pollId, function (resp2) {
                pollObj['questions'] = resp2.body.value[0];
               
                //get the answers for the poll
                data.getEntitiesByPoll("Answer", pollId, function (resp3) {
                    pollObj['answers'] = resp3.body.value;
                    pollObj.answers.sort(function(a, b){return a.order - b.order;});
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
        var pollId = resp.RowKey;
        
        //add a new question
        data.createQuestion(pollId, req.body, function (resp2) {
            var questionId = resp2.RowKey;
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
         pollObj['poll'] = resp.body.value[0];
            
            //get the questions for the poll
            data.getEntitiesByPoll("Question", pollId, function (resp2) {
                pollObj['question'] = resp2.body.value[0];
                
                //get the answers for the poll
                data.getEntitiesByPoll("Answer", pollId, function (resp3) {
                    pollObj['answers'] = resp3.body.value;
                    pollObj.answers.sort(function(a, b){return a.order - b.order;});
                    res.render('edit', pollObj); 
                });
            });   
    });
});

//edit a poll
router.post('/edit/:RowKey', function (req, res) {
    var pollId = req.params.RowKey;
    var postData = req.body;
    
    var answerObj = {"adds":[], "edits":[], "deletes":[]};
    
    for(var i=0; i < postData.answerId.length; i++){  
        var props = {};
        for (var key in postData) {
            if (postData.hasOwnProperty(key)) {
                props[key] = postData[key][i] || postData[key][0];
            }
        }
        if(postData.answerId[i] == ""){                                          
            if(postData.answers[i] != undefined) {
                answerObj.adds.push(props);
            }
        }
        else if(postData.answers[i] != undefined){
            answerObj.edits.push(props);
        }
        else {
            answerObj.deletes.push(props);
        }
    }
    console.log(answerObj.deletes);
    
    //update the poll
    data.editPoll(postData, function () {
        
        //update the questions
        data.editQuestion(postData, function(resp2){
            var questionId = resp2.RowKey;
    
            //create any new answers
            data.createAnswers(answerObj.adds, function(){
                
                //delete any removed answers
                //data.deleteAnswers(req.body, function(){
                    
                    //update the existing answers
                    data.editAnswers(answerObj.edits, "none", function(){
                        res.redirect('/view/'+pollId+'?mode=preview');
                    }); 
                //});
                
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