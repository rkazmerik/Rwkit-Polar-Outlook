'use script';

//required node modules
var fs = require('fs');
var express = require('express');
var hbs = require('express-handlebars');
var http = require('http');
var https = require('https');

//required route script files
var answer = require('./routes/answer');
var poll = require('./routes/poll');
var question = require('./routes/question');
var response = require('./routes/response');
var root = require('./routes/root');
var survey = require('./routes/survey');

var https_options = {
  key: fs.readFileSync('./certs/localhost-key.pem'),
  cert: fs.readFileSync('./certs/localhost-cert.pem')
};

var port = process.env.PORT || 8080;
var sslPort = 8888;
    
var app = express();
app.engine('hbs', hbs( {
    extname:'hbs', 
    defaultLayout:'master.hbs',
    helpers: {
      toJSON : function(object) {
        return JSON.stringify(object);
      }
    }
}));
    
app.set('view engine', 'hbs');

http.createServer(app).listen(port);

https.createServer(https_options, app)
                  .listen(sslPort);
                  
console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+');
console.log('HTPP Server listening on PORT:', port);
console.log('HTPPS Server listening on PORT:', sslPort);
console.log('+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+');

//routes for default path, scripts, styles and images
app.use('/', root);
app.use('/answers', answer);
app.use('/polls', poll);
app.use('/questions', question);
app.use('/responses', response);
app.use('/surveys', survey);
app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/manifest', express.static(__dirname + '/manifest'));