var bodyParser = require('body-parser')
var express = require('express');
var data = require("../data/answer.js");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for getting all answers
router.get('/', function(req, res) {
    data.getAnswers(function (resp) {
        res.render('root/answers', resp);
    });
});

//route for deleting an answer
router.get('/delete/:answerId', function(req, res) {
    var answerId = req.params.answerId;
    
    data.deleteAnswer(answerId, function (resp) {
        res.redirect('/answers');
    });
});

module.exports = router;

