$(function() {
  socket.on("connect", function() {
    socket.emit("nodeListRequest");
  });

  socket.on("reconnect", function() {
    socket.emit("nodeListRequest");
  });

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
    animator.removeAllNodes();

    for(var i = 0; i < data.list.length; i++) {
      animator.addNode(data.list[i]);
    }
  });

  socket.on("error", function(data) {
    showError(data.error);
  });
});

function addMessageToDOM(traffic) {
  var trafficFeed = $('#trafficFeed');
  trafficFeed.prepend("<p class=\"trafficMessage\">" + traffic + "</p>");

  if (trafficFeed[0].childElementCount > 10) {
    trafficFeed.html(trafficFeed.children().slice(0,10));
  }
}
