function TrafficMessage() {
  var self = this;

  self.msg = '';
  self.data = {};
  self._sourceProtocol = undefined;
  self._targetProtocol = undefined;
  self._sourceMAC = undefined;
  self._targetMAC = undefined;
}

TrafficMessage.prototype.setSourceProtocolAddress = function(address) {
  this._sourceProtocol = address;
};

TrafficMessage.prototype.getSourceProtocolAddress = function() {
  return this._sourceProtocol;
};

TrafficMessage.prototype.hasSourceProtocolAddress = function() {
  var result = false;
  if (this._sourceProtocol) {
    result = true;
  }

  return result;
};

TrafficMessage.prototype.setTargetProtocolAddress = function(address) {
  this._targetProtocol = address;
};

TrafficMessage.prototype.getTargetProtocolAddress = function() {
  return this._targetProtocol;
};

TrafficMessage.prototype.hasTargetProtocolAddress = function() {
  var result = false;
  if (this._targetProtocol) {
    result = true;
  }

  return result;
};

TrafficMessage.prototype.setSourceMAC = function(mac) {
  this._sourceMAC = mac;
};

TrafficMessage.prototype.getSourceMAC = function() {
  return this._sourceMAC;
};

TrafficMessage.prototype.hasSourceMAC = function() {
  var result = false;
  if (this._sourceMAC) {
    result = true;
  }

  return result;
};

TrafficMessage.prototype.setTargetMAC = function(mac) {
  this._targetMAC = mac;
};

TrafficMessage.prototype.getTargetMAC = function() {
  return this._targetMAC;
};

TrafficMessage.prototype.hasTargetMAC = function() {
  var result = false;
  if (this._targetMAC) {
    result = true;
  }

  return result;
};

module.exports = TrafficMessage;
