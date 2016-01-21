function NodeManager() {
  this._nodes = [];
  this._subject = new Subject();
}

NodeManager.prototype.addObserver = function(observer) {
  this._subject.registerObserver(observer);
};

NodeManager.prototype.removeObserver = function(observer) {
  this._subject.deregisterObserver(observer);
};

NodeManager.prototype.addNode = function(newNode) {
  var self = this;

  if (self._nodes.indexOf(newNode) < 0) {
    self._nodes.push(newNode);
    self._subject.notify({add: newNode});
    return true;
  } else {
    return false;
  }
};

NodeManager.prototype.removeNode = function(node) {
  var self = this;
  var nodeIndex = self._nodes.indexOf(node);

  if (nodeIndex > -1) {
    self._nodes.splice(nodeIndex, 1);
    self._subject.notify({remove: newNode});
    return true;
  } else {
    return false;
  }
};
