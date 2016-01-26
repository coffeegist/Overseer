function Node(ip) {
  this._ip = ip;
  this._mac = undefined;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};

Node.prototype.getMAC = function() {
  var self = this;

  return self._mac;
};

Node.prototype.toJSON = function() {
  var self = this;
  var result = {
    ip: self._ip,
    mac: self._mac
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
