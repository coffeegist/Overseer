function Node(ip) {
    this._x = 0;
    this._y = 0;
    this._ip = ip;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};
