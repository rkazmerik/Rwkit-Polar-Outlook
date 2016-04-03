var bodyParser = require('body-parser')
var express = require('express');
var data = require("../data/response.js");
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//route for getting all responses
router.get('/', function(req, res) {
    data.getResponses(function (resp) {
        res.render('root/responses', resp);
    });
});

//route for deleting a response
router.get('/delete/:responseId', function(req, res) {
    var responseId = req.params.responseId;
    
    data.deleteResponse(responseId, function (resp) {
        res.redirect('/responses');
    });
});

module.exports = router;

