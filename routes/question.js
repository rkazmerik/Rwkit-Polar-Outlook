var bodyParser = require('body-parser')
var express = require('express');
var data = require("../data/question.js");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for getting all questions
router.get('/', function(req, res) {
    data.getQuestions(function (resp) {
        res.render('root/questions', resp);
    });
});

//route for deleting a question
router.get('/delete/:questionId', function(req, res) {
    var questionId = req.params.questionId;
    
    data.deleteQuestion(questionId, function (resp) {
        res.redirect('/questions');
    });
});

module.exports = router;

