/*************************************
//
// app app
//
**************************************/

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var device  = require('express-device');
var sessionManager = require('./server/SessionManagerFactory')(server);
var runningPortNumber = process.env.PORT || 3000;

app.configure(function(){
  // I need to access everything in '/client/public' directly
  app.use(express.static(__dirname + '/client/public'));

  //set the view engine
  app.set('view engine', 'ejs');
  app.set('views', __dirname +'/client/views');

  app.use(device.capture());
});

// logs every request
app.use(function(req, res, next){
  // output every request in the array
  console.log({method:req.method, url: req.url, device: req.device});

  // goes onto the next function in line
  next();
});

app.get("/", function(req, res){
  res.render('index', {});
});

console.log("Port: ", runningPortNumber);
server.listen(runningPortNumber);
