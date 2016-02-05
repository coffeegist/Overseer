var app = app || {};
var socket = io.connect();
var animator = new Animator();

$(function() {
  var $allTraffic = $('#trafficFeed');
  var $startButton = $('#startCapture');
  var $stopButton = $('#stopCapture');

  $startButton.click(function(e) {
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });
});
