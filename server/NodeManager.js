var _path = require('path');
var appPath = _path.dirname(require.main.filename);

var SocketUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'SocketUtilities')
);

function NodeManager(io) {
  var self = this;
  self._nodes = [];
  self._io = io;
  self._nodeBlock = false;

  if (SocketUtilities.ioObjectIsValid(self._io)) {
    self._io.on('connection', function(socket) {
      self._handleSocketTraffic(socket)
    });
  } else {
    throw new Error("IO parameter required.");
  }
}

NodeManager.prototype.addNode = function(newNode) {
  var self = this;
  var result = false;

  try {
    if (self._findNodeIndexByIP(newNode.getIP()) < 0) {
      self._nodes.push(newNode);
      self._io.sockets.emit('newNode', {
        node: newNode.toJSON()
      });
      result = true;
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
  var nodeIndex = self._findNodeIndexByIP(node.getIP());

  try {
    if (nodeIndex > -1) {
      self._nodes.splice(nodeIndex, 1);
      self._io.sockets.emit('removeNode', {
        ip: node.getIP()
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
}
module.exports = NodeManager;
