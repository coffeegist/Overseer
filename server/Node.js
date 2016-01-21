function Node(ip) {
  this._ip = ip;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};

Node.prototype.toJSON = function() {
  var self = this;
  var result = {
    ip: self._ip
  };

  return result;
}
module.exports = Node;
