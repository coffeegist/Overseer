// connect to our socket server
var socket = io.connect(); //io.connect('http://127.0.0.1:1337/');

var app = app || {};


// shortcut for document.ready
$(function(){
  //setup some common vars
  var $allPostsTextArea = $('#allPosts'),
    $allTraffic = $('#allPostsAdam'),
    $startButton = $('#startCapture');
    $stopButton = $('#stopCapture');


  //SOCKET STUFF
  socket.on("traffic", function(data){
    //var copy = $allPostsTextArea.html();
    //$allPostsTextArea.html('<p>' + copy + data.msg + "</p>");
    //$allPostsTextArea.scrollTop($allPostsTextArea[0].scrollHeight - $allPostsTextArea.height());
    $allTraffic.prepend(data.msg + '<br/>');
    console.log("Appended: " + data);
    //.css('scrollTop', $allPostsTextArea.css('scrollHeight'));
  });

  $startButton.click(function(e){
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });

});
