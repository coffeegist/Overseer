function Cluster() {
  this._nodes = [];
  this.MAX_NODES = 8;
}

Cluster.prototype.addNode = function(newNode, stage) {
  var self = this;

  if (!self.isNodeInCluster(newNode)) {
    if (self._nodes.length < self.MAX_NODES) {
      self._nodes.push(newNode);
    } else {
      stage.removeChild(self._nodes[0].graphic);
      self._nodes.splice(0, 1);
      self._nodes.unshift(newNode);
    }

    stage.addChild(newNode.graphic);
    return true;
  } else {
    return false;
  }
};

Cluster.prototype.removeNode = function(node) {
  var self = this;
  var nodeIndex = self._nodes.indexOf(node);

  if (nodeIndex > -1) {
    self._nodes.splice(nodeIndex, 1);
    return true;
  } else {
    return false;
  }
};

Cluster.prototype.isFull = function() {
  var self = this;
  var result = false;

  if (self._nodes.length >= self.MAX_NODES) {
    result = true;
  }

  return result;
}

Cluster.prototype.isNodeInCluster = function(node) {
  var self = this;
  var result = false;

  for (var i=0; i<self._nodes.length; i++) {
    if (self._nodes[i].getIP() == node.getIP()) {
      result = true;
      break;
    }
  }

  return result;
};

Cluster.prototype.getNumberOfNodes = function() {
  var self = this;

  return self._nodes.length;
};

Cluster.prototype.getNode = function(index) {
  var self = this;

  if (index < self._nodes.length && index >= 0) {
    return self._nodes[index];
  } else {
    return {};
  }
};

Cluster.prototype.getNodeByIP = function(ip) {
  var self = this;
  var result = undefined;

  for (var i=0; i<self._nodes.length; i++) {
    if (self._nodes[i].getIP() == ip) {
      result = self._nodes[i];
      break;
    }
  }

  return result;
};
