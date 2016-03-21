var socketio = require('socket.io');
var _path = require('path');
var appPath = _path.dirname(require.main.filename);

var NetworkCaptor = require(_path.join(appPath, 'server', 'NetworkCaptor'));
var NodeManager = require(_path.join(appPath, 'server', 'NodeManager'));
var TrafficPackager = require(_path.join(appPath, 'server', 'TrafficPackager'));

module.exports = function(app) {
  var networkCaptor = new NetworkCaptor();
  var nodeManager = new NodeManager();
  var trafficPackager = new TrafficPackager();
  var io = socketio.listen(app);
  io.set('log level', 1);

  /********************************/
  /* Communication from front end */
  /********************************/
  io.sockets.on('connection', function(socket) {
    socket.emit('system', {
      msg:"<span style=\"color:red !important\">Connected to Dispatch</span>"
    });

    socket.on('startCapture', function() {
      var msg = "";

      if (networkCaptor.start()) {
        msg = "<span style=\"color:red !important\">Starting Capture!</span>";
      } else {
        msg = "<span style=\"color:red !important\">An Error Occurred!</span>";
      }
      socket.emit('system', {
        msg: msg
      });
    });

    socket.on('stopCapture', function() {
      var msg = "";

      if (networkCaptor.stop()) {
        msg = "<span style=\"color:red !important\">Stopping Capture!</span>";
      } else {
        msg = "<span style=\"color:red !important\">An Error Occurred!</span>";
      }
      socket.emit('system', {
        msg: msg
      });
    });

    socket.on('nodeListRequest', function() {
      var list = nodeManager.getNodeList(socket);
      socket.emit('nodeList', {list: list});
    });

    socket.on('updateCurrentInterface', function(data) {
      networkCaptor.setDevice(data.name);
      socket.emit('interfaceSettings', networkCaptor.getDeviceSettings());
    });

    socket.on('getInterfaceSettings', function() {
      socket.emit('interfaceSettings', networkCaptor.getDeviceSettings());
    });

    socket.on('interfaceListRequest', function() {
      socket.emit('interfaceList', {list: networkCaptor.getDeviceList()});
    });

    socket.on('enableMonitorMode', function() {
      networkCaptor.enableMonitorMode();
    });

    socket.on('disableMonitorMode', function() {
      networkCaptor.disableMonitorMode();
    });
  });

  /****************************************/
  /* Communication of back end components */
  /****************************************/
  networkCaptor.on("arp", function(data) {
    trafficPackager.packageTraffic(data, 'arp');
  });

  networkCaptor.on("ipv4", function(data) {
    trafficPackager.packageTraffic(data, 'ipv4');
  });

  networkCaptor.on("ipv6", function(data) {
    trafficPackager.packageTraffic(data, 'ipv6');
  });

  networkCaptor.on("airmon-finished", function() {
    io.sockets.emit('interfaceList', {list: networkCaptor.getDeviceList()});
  });

  networkCaptor.on('error', function(error) {
    io.sockets.emit('error', error);
  });

  nodeManager.on('newNode', function(nodeData) {
    io.sockets.emit('newNode', nodeData);
  });

  trafficPackager.on('trafficPackageReady', function(traffic) {
    nodeManager.checkTrafficForNewNodes(traffic.addresses);
    io.sockets.emit('traffic', traffic);
  });
};
