var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Node = require(_path.join(appPath, 'server', 'Node'));
var SocketUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'SocketUtilities')
);

function NodeManager() {
  var self = this;
  EventEmitter.call(this);

  self._nodes = [];
  self._nodeBlock = false;
}
util.inherits(NodeManager, EventEmitter);

NodeManager.prototype.addNode = function(newNode) {
  var self = this;
  var result = false;

  try {
    if (newNode.getMAC() != "0:0:0:0:0:0") {
      if (self._findNodeIndexByIP(newNode.getMAC()) < 0) {
        self._nodes.push(newNode);
        self.emit('newNode', {
          node: newNode.toJSON()
        });
        result = true;
      }
    }
  } catch (e) {
    console.log('NodeManager.addNode: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype.removeNode = function(node) {
  var self = this;
  var result = false;
  var nodeIndex = self._findNodeIndexByMAC(node.getMAC());

  try {
    if (nodeIndex > -1) {
      self._nodes.splice(nodeIndex, 1);
      self.emit('removeNode', {
        node: node.toJSON
      });
      result = true;
    }
  } catch (e) {
    console.log('NodeManager.removeNode: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype.sendNodeList = function(socket) {
  var self = this;
  var list = [];

  for (var i=0; i<self._nodes.length; i++) {
    list[i] = self._nodes[i].toJSON();
  }

  socket.emit('nodeList', {list: list});
};

NodeManager.prototype._handleSocketTraffic = function(socket) {
  var self = this;

  socket.on('nodeListRequest', function() {
    self.sendNodeList(socket);
  });
};

NodeManager.prototype._findNodeIndexByIP = function(ip) {
  var self = this;
  var result = -1;

  try {
    for (var i=0; i<self._nodes.length; i++) {
      if (self._nodes[i].getIP() == ip) {
        result = i;
        break;
      }
    }
  } catch (e) {
    console.log('NodeManager._findNodeIndexByIP: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype._findNodeIndexByMAC = function(mac) {
  var self = this;
  var result = -1;

  try {
    for (var i=0; i<self._nodes.length; i++) {
      if (self._nodes[i].getMAC() == mac) {
        result = i;
        break;
      }
    }
  } catch (e) {
    console.log('NodeManager._findNodeIndexByMAC: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype._checkTrafficForNewNodes = function(trafficMessage) {
  var self = this;
  var sourceMAC = undefined;
  var targetMAC = undefined;
  var newNode = undefined;

  try {
    sourceMAC = trafficMessage.getSourceMAC() || trafficMessage.data.sourceMAC;
    newNode = new Node(trafficMessage.getSourceProtocolAddress(), sourceMAC);
    self.addNode(newNode);

    targetMAC = trafficMessage.getTargetMAC() || trafficMessage.data.destMAC;
    newNode = new Node(trafficMessage.getTargetProtocolAddress(), targetMAC);
    self.addNode(newNode);
  } catch (e) {
    console.log("NodeManager._checkTrafficForNewNodes: ", e);
  }
};

module.exports = NodeManager;
