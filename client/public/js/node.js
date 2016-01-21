function Node(ip) {
  this._ip = ip;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};
