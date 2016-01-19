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
    $startButton = $('#startCapture');
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
    var newNode = new Node(data.ip);
    nodeManager.addNode(newNode);
  });

  socket.on("deviceList", function(data) {
    var list = data.list; // list of IP addresses

    var newNode = undefined;
    for(var i = 0; i < list.length; i++) {
      newNode = new Node(list[i]);
      nodeManager.addNode(newNode);
    }
  });

  $startButton.click(function(e) {
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });

});

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
