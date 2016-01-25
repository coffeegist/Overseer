// connect to our socket server
var socket = io.connect();

var app = app || {};

var nodeManager = new NodeManager();
var trafficManager = new TrafficManager();
var animator = new Animator();
nodeManager.addObserver(animator);
trafficManager.addObserver(animator);

// shortcut for document.ready
$(function(){
  //setup some common vars
  var $allPostsTextArea = $('#allPosts'),
    $allTraffic = $('#trafficFeed'),
    $startButton = $('#startCapture'),
    $stopButton = $('#stopCapture');


  //SOCKET STUFF

  // Request a list of nodes currently being tracked
  socket.emit("nodeListRequest");

  socket.on("traffic", function(data) {
    $allTraffic.prepend(data.msg + '<br/>');

    var traffic = new Traffic(data.data);
    trafficManager.processTraffic(traffic);
  });

  socket.on("newNode", function(data) {
    var newNode = new Node(data.node);
    nodeManager.addNode(newNode);
  });

  socket.on("nodeList", function(data) {
    for(var i = 0; i < data.list.length; i++) {
      var newNode = new Node(data.list[i]);
      nodeManager.addNode(newNode);
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
