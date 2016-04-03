var bodyParser = require('body-parser')
var express = require('express');
var data = require('../data');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for getting all surveys
router.get('/', function (req, res) {
    data.entity.getEntities("Survey", function (resp) {
        res.render('survey/surveys', resp);
    });
});

//route for getting a survey
router.get('/view/:surveyId', function (req, res) {
        var surveyId = req.params.surveyId;
        var surveyObj = {};
        
        //get the survey
        data.entity.getEntity(surveyId, function (resp) {
            surveyObj['survey'] = resp;
            
            //get the questions for the poll
            data.question.getQuestionsByEntity(surveyId, function (questions) {
                surveyObj['questions'] = questions;
                res.render('survey/survey', surveyObj); 
            })            
        });
});

//show new survey form
router.get('/create', function (req, res) {
    res.render('survey/create-survey');
});

//create a new survey
router.post('/create', function (req, res) {
    data.entity.createEntity(req.body, "Survey", function (resp) {
        var surveyId = resp.RowKey._;
        
        //add a new question
        data.question.createQuestions(surveyId, req.body, function () {
            res.redirect('survey//surveys');    
        });      
    });
});

//show edit survey form
router.get('/edit/:RowKey', function (req, res) {
    var surveyId = req.params.RowKey;
    var surveyObj = {};
    
    //get the survey        
    data.entity.getEntity(surveyId, function (resp) {
         surveyObj['survey'] = resp;
            
            //get the questions for the survey
            data.question.getQuestionsByEntity(surveyId, function (questions) {
                surveyObj['questions'] = questions;
                res.render('survey/edit-survey', surveyObj); 
            });   
    });
});

//edit a survey 
router.post('/edit/:RowKey', function (req, res) {
   
    //update the survey
    data.entity.editEntity(req.body, "Survey", function () {
        
        //update the questions
        data.question.editQuestions(req.body, function(){
            res.redirect('survey/surveys');
        });
    });
});

//route for deleting a survey
router.get('/delete/:RowKey', function (req, res) {
    var surveyId = req.params.RowKey;
    
        //delete the related questions
        data.question.deleteQuestionsByEntity(surveyId, function(){

            //delete related responses
            data.response.deleteResponsesByEntity(surveyId, function(){
                   
                //delete the poll
                data.entity.deleteEntity(surveyId, "Survey", function(){
                    res.redirect('survey/surveys');  
                });
            });
        });
});

//route for getting responses for a survey
router.get('/:surveyId/responses', function (req, res) {
    data.response.getResponsesByEntity(req.params.surveyId, function (resp) {
        res.render('root/responses', resp);
    });
});

//route for submitting a response
router.post('/view/:surveyId', function (req, res) {
    var responseObj = req.body;
    var surveyId = req.params.surveyId;
    var user = req.query.user || "admin";
    
    data.response.createResponses(surveyId, responseObj, user, function (resp) {
        res.redirect("survey/surveys");  
    });
});

module.exports = router;