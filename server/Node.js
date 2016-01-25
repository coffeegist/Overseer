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
};

Node.prototype.isAddressClassC = function() {
  var self = this;
  var result = false;
  var firstOctet = Number(self._ip.substring(0,3));

  if (firstOctet >= 192 && firstOctet <= 223) {
    result = true;
  }

  return result;
};

module.exports = Node;
