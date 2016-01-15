// connect to our socket server
var socket = io.connect(); //io.connect('http://127.0.0.1:1337/');

var app = app || {};


// shortcut for document.ready
$(function(){
  //setup some common vars
  var $allPostsTextArea = $('#allPosts'),
    $allTraffic = $('#trafficFeed'),
    $startButton = $('#startCapture');
    $stopButton = $('#stopCapture');


  //SOCKET STUFF
  socket.on("traffic", function(data){
    $allTraffic.prepend(data.msg + '<br/>');
    shootLaser(50, getRandom(0,500), 850, 250);
  });

  $startButton.click(function(e){
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });

});

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
