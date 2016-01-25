function ClusterManager() {
  var self = this;
  self._clusters = [];
  self._nextCluster = 1;
  self.MAX_CLUSTERS = 9;

  for( var i=0; i<self.MAX_CLUSTERS; i++) {
    self._clusters.push(new Cluster());
  }
}

ClusterManager.prototype.addNode = function(newNode, addToCenter, stage) {
  var self = this;
  var toCenter = addToCenter || false;
  var result = false;

  var clusterIndex = self._nextCluster;
  if (toCenter) {
    clusterIndex = 0;
  }

  if (!self.isNodeTracked(newNode)) {
    self._clusters[clusterIndex].addNode(newNode, stage);
    self._adjustClusterIndex();
    result = true;
  }

  return result;
};

ClusterManager.prototype.removeNode = function(node) {
  var self = this;

  for (var i=0; i<self.MAX_CLUSTERS; i++) {
    if (self._clusters[i].isNodeInCluster(node)) {
      self._clusters[i].removeNode(node);
    }
  }
};

ClusterManager.prototype.isNodeTracked = function(node) {
  var self = this;
  var result = false;

  for (var i=0; i<self.MAX_CLUSTERS; i++) {
    if (self._clusters[i].isNodeInCluster(node)) {
      result = true;
      break;
    }
  }

  return result;
};

ClusterManager.prototype.getCluster = function(index) {
  var self = this;

  if (index < self.MAX_CLUSTERS && index >= 0) {
    return self._clusters[index];
  } else {
    return {};
  }
};

ClusterManager.prototype.getNodeByIP = function(ip) {
  var self = this;
  var node = undefined;

  for (var i=0; i<self.MAX_CLUSTERS; i++) {
    if (node = self._clusters[i].getNodeByIP(ip)) {
      break;
    }
  }

  return node;
};

ClusterManager.prototype.getNumberOfClusters = function() {
  var self = this;

  return self.MAX_CLUSTERS;
};

ClusterManager.prototype._adjustClusterIndex = function() {
  var self = this;
  var result = false;

  if (self._clusters[self._nextCluster].isFull()) {
    if (++self._nextCluster >= self.MAX_CLUSTERS) {
      self._nextCluster = 1;
    }
  }
};
