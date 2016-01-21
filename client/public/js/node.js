function Node(jsonNode) {
  this._ip = jsonNode.ip;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};
