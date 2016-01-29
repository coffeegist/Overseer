var socketio = require('socket.io');
var _path = require('path');
var appPath = _path.dirname(require.main.filename);

var NetworkCaptor = require(_path.join(appPath, 'server', 'NetworkCaptor'));
var TrafficProcessor = require(_path.join(appPath, 'server', 'TrafficProcessor'));
var NodeManager = require(_path.join(appPath, 'server', 'NodeManager'));
var Node = require(_path.join(appPath, 'server', 'Node'));

module.exports = function(app) {
  var networkCaptor = new NetworkCaptor({device: 'wlan0'});
  var trafficProcessor = new TrafficProcessor();
  var nodeManager = new NodeManager();
  var io = socketio.listen(app);
  io.set('log level', 1);

  /********************************/
  /* Communication from front end */
  /********************************/
  io.sockets.on('connection', function(socket) {
    socket.emit('traffic', {
      msg:"<span style=\"color:red !important\">Connected to Dispatch</span>",
      data: {type: 'sys'}
    });

    socket.on('startCapture', function() {
      var msg = "";

      if (networkCaptor.start()) {
        msg = "<span style=\"color:red !important\">Starting Capture!</span>";
      } else {
        msg = "<span style=\"color:red !important\">An Error Occurred!</span>";
      }
      socket.emit('traffic', {
        msg: msg,
        data: {type: 'sys'}
      });
    });

    socket.on('stopCapture', function() {
      var msg = "";

      if (networkCaptor.stop()) {
        msg = "<span style=\"color:red !important\">Stopping Capture!</span>";
      } else {
        msg = "<span style=\"color:red !important\">An Error Occurred!</span>";
      }
      socket.emit('traffic', {
        msg: msg,
        data: {type: 'sys'}
      });
    });

    socket.on('nodeListRequest', function() {
      var list = nodeManager.getNodeList(socket);
      socket.emit('nodeList', {list: list});
    });
  });

  /****************************************/
  /* Communication of back end components */
  /****************************************/
  networkCaptor.on('newPacket', function(packet) {
    trafficProcessor.processGenericPacket(packet);
  });

  networkCaptor.on('error', function(error) {
    io.sockets.emit('error', error);
  });

  trafficProcessor.on('traffic', function(traffic) {
    nodeManager._checkTrafficForNewNodes(traffic);
    io.sockets.emit('traffic', traffic);
  });

  nodeManager.on('newNode', function(nodeData) {
    io.sockets.emit('newNode', nodeData);
  });
};
