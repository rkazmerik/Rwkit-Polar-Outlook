var express = require('express');
var router = express.Router();

//route for getting home page
router.get('/', function(req, res) {
    res.render('root/index');
});

//route for getting manifest
router.get('/manifest', function(req, res) {
    res.contentType('application/xml');
    res.sendFile('/manifest.xml');
});

module.exports = router;

