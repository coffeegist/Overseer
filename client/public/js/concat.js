// connect to our socket server
var socket = io.connect();

var app = app || {};
var animator = new Animator();

// shortcut for document.ready
$(function(){
  //setup some common vars
  var $allTraffic = $('#trafficFeed'),
    $startButton = $('#startCapture'),
    $stopButton = $('#stopCapture');


  //SOCKET STUFF

  // Request a list of nodes currently being tracked
  socket.emit("nodeListRequest");

  socket.on("system", function(data) {
    addMessageToDOM(data.msg);
  });

  socket.on("traffic", function(data) {
    var result = animator.displayTraffic(data.traffic[0], data.traffic[1], data.type);
    if (result) {
      addMessageToDOM(data.type + "." + result.toString() + ": " + data.msg);
    }
  });

  socket.on("newNode", function(data) {
    animator.addNode(data.ip);
  });

  socket.on("nodeList", function(data) {
    for(var i = 0; i < data.list.length; i++) {
      animator.addNode(data.list[i]);
    }
  });

  socket.on("error", function(data) {
    showError(data.error);
  });

  $startButton.click(function(e) {
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });
});

function showError(message) {
  $("#error-message").html(message);
  $(".error-modal").modal();
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function addMessageToDOM(traffic) {
  var trafficFeed = $('#trafficFeed');
  trafficFeed.prepend("<p class=\"trafficMessage\">" + traffic + "</p>");

  if (trafficFeed[0].childElementCount > 10) {
    trafficFeed.html(trafficFeed.children().slice(0,10));
  }
}
