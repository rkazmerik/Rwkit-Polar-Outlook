var bodyParser = require('body-parser')
var express = require('express');
var app = require("../scripts/app.js");
var data = require("../scripts/data.js");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var config = {
    colors : ['004578','106EBE','00BCF2','B3D6F2','004B50',
                 '008272','00B294','32145A','5C2D91','5C005C']
};
    
//route for detecting current poll in email
router.get('/view', function (req, res) {
    res.render('redirect');
});

//route for getting a poll
router.get('/view/:pollId', function (req, res) {
    var pollObj = {pollId: req.params.pollId};
    pollObj.preview = req.query.mode;
    
    //get the poll
    data.getPoll("Poll", pollObj.pollId, function (resp) {
        pollObj.title = resp.body.value[0].title;
        
        //get the questions for the poll
        data.getEntitiesByPoll("Question", pollObj.pollId, function (resp2) {
            pollObj.questionId = resp2.body.value[0].RowKey;
            pollObj.question = resp2.body.value[0].question;
            
            //get the answers for the poll
            data.getEntitiesByPoll("Answer", pollObj.pollId, function (resp3) {
                pollObj.answers = resp3.body.value;
                pollObj.answers.sort(function(a, b){return a.order - b.order;});
                res.render('view', pollObj); 
            });  
        })        
    });  
});

//route for submitting a response
router.post('/view/:pollId', function (req, res) {
    var responseObj = {pollId: req.params.pollId};
    responseObj.mode = req.params.mode;
    responseObj.user = req.params.user;
    
    var i = req.body.answers;
    responseObj.answerId = req.body.answerId[i];
    responseObj.answer = req.body.answer[i];
    responseObj.tally = req.body.tally[i];
    
    //update the answer tally
    data.updateTally(responseObj, function (resp) {      
        
        //create the response
        console.log(req);
        if(responseObj.mode) {
            console.log("Creating");
            data.createResponses(responseObj, function(){
                res.redirect('/donut/'+responseObj.pollId);  
            });  
        }
    });
});

//show new poll form
router.get('/create', function (req, res) {
    res.render('create', config);
});

//create a new poll
router.post('/create', function (req, res) {
    var pollObj = {title : req.body.title};
    pollObj.question = req.body.question;
    pollObj.answers = req.body.answers;
    pollObj.colors = req.body.colors;
    
    data.createPoll(pollObj, function (resp) {
        pollObj.pollId = resp.RowKey;
        
        //add a new question
        data.createQuestion(pollObj, function (resp2) {
            pollObj.questionId = resp2.RowKey;
            
            //add new answer(s)
            data.createAnswers(pollObj, function(resp3){
                res.redirect('view/'+pollObj.pollId+'?mode=preview');    
            })
        });      
    });
});

//show edit poll form
router.get('/edit/:RowKey', function (req, res) {
    var pollObj = {pollId : req.params.RowKey};
    
    //get the poll        
    data.getPoll("Poll", pollObj.pollId, function (resp) {
         pollObj.title = resp.body.value[0].title;
            
        //get the questions for the poll
        data.getEntitiesByPoll("Question", pollObj.pollId, function (resp2) {
            pollObj.question = resp2.body.value[0].question;
            pollObj.questionId = resp2.body.value[0].RowKey;
            
            //get the answers for the poll
            data.getEntitiesByPoll("Answer", pollObj.pollId, function (resp3) {
                pollObj.answers = resp3.body.value
                pollObj.colors = config.colors;
                pollObj.answers.sort(function(a, b){return a.order - b.order;});
                console.log(pollObj);
                res.render('edit', pollObj); 
            });
        });   
    });
});

//edit a poll
router.post('/edit/:pollId', function (req, res) {
    var pollObj = {pollId: req.params.pollId};
    pollObj.title = req.body.title;
    pollObj.answers = req.body.answers;
    pollObj.colors = req.body.colors;
    
    //update the poll
    data.editPoll(pollObj, function () {
        pollObj.questionId = req.body.questionId;
        pollObj.question = req.body.question;
        
        //update the questions
        data.editQuestion(pollObj, function(resp2){
            
            //delete the old answers
            data.deleteEntitiesByPoll("Answer", pollObj, function(resp3){
                
                //create new answers
                data.createAnswers(pollObj, function(){
                    res.redirect('/view/'+req.body.entityId+'?mode=preview');
                });
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
        /*
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
        */
});

module.exports = router;