// Required Core Modules
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Required Custom Modules
var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var Node = require(_path.join(appPath, 'server', 'Node'));

function NodeManager() {
  var self = this;
  EventEmitter.call(this);

  self._nodeMap = {};
}
util.inherits(NodeManager, EventEmitter);

NodeManager.prototype.addNode = function(newNode) {
  var self = this;
  var result = false;

  try {
    var newIP = newNode.getIP();
    if (!(newIP in self._nodeMap)) {
      self._nodeMap[newIP] = newNode;
      self.emit('newNode', {
        ip: newIP
      });
      result = true;
    }
  } catch (e) {
    console.log('NodeManager.addNode: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype.removeNode = function(ip) {
  var self = this;
  var result = false;

  try {
    if (ip in self._nodeMap) {
      delete self._nodeMap[ip];
      self.emit('removeNode', {
        ip: ip
      });
      result = true;
    }
  } catch (e) {
    console.log('NodeManager.removeNode: ', e);
  } finally {
    return result;
  }
};

NodeManager.prototype.getNodeList = function() {
  var self = this;
  var list = [];
  var i = 0;

  for (ip in self._nodeMap) {
    list[i++] = self._nodeMap[ip].getIP();
  }

  return list;
};

NodeManager.prototype.checkTrafficForNewNodes = function(addressArray) {
  var self = this;
  var sourceMAC = undefined;
  var targetMAC = undefined;
  var newNode = undefined;

  try {
    for (var i=0; i<addressArray.length; i++) {
      self.addNode(new Node(addressArray[i]));
    }
  } catch (e) {
    console.log("NodeManager.checkTrafficForNewNodes: ", e);
  }
};

module.exports = NodeManager;
