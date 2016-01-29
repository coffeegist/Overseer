function Node(jsonNode) {
  this._ip = jsonNode.ip;
  this._mac = jsonNode.mac;
  this.graphic = undefined;
  this.x = 0;
  this.y = 0;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};

Node.prototype.getMAC = function() {
  var self = this;

  return self._mac;
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
