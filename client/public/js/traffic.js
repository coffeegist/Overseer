function Traffic(packet) {
  try {
    this._type = packet.type;
    this._senderMAC = packet.sourceMAC;
    this._targetMAC = packet.destMAC;

    if (packet.type == 'ipv4') {
      this._senderProtocolAddress = packet.sourceIP;
      this._targetProtocolAddress = packet.destIP;
      this._senderPort = packet.sourcePort;
      this._targetPort = packet.destPort;
      this._payload = packet.payload;
      this._color = "red";
    } else if (packet.type == 'ipv6') {
      this._senderProtocolAddress = packet.sourceIP;
      this._targetProtocolAddress = packet.destIP;
      this._senderPort = packet.sourcePort;
      this._targetPort = packet.destPort;
      this._payload = packet.payload;
      this._color = "green";
    } else if (packet.type == 'arp') {
      this._senderHardwareAddress = packet.senderHardwareAddress;
      this._senderProtocolAddress = packet.senderProtocolAddress;
      this._targetHardwareAddress = packet.targetHardwareAddress;
      this._targetProtocolAddress = packet.targetProtocolAddress;
      this._operationString = 'ARP ' + packet.opString;
      this._color = "blue";
    }
  } catch(e) {
    // do nothing.
  }
}

Traffic.prototype.getType = function() {
  return this._type;
};

Traffic.prototype.getColor = function() {
  return this._color;
};

Traffic.prototype.getSourceIP = function() {
  var self = this;
  var result = undefined;

  if (self._type == 'ipv4') {
    result = self._senderProtocolAddress;
  } else if (self._type == 'arp') {
    result = self._senderProtocolAddress;
  } else {
    result = "unknown";
  }

  return result;
};

Traffic.prototype.getDestinationIP = function() {
  var self = this;
  var result = undefined;

  if (self._type == 'ipv4' || self._type == 'ipv6') {
    result = self._targetProtocolAddress;
  } else if (self._type == 'arp') {
    result = self._targetProtocolAddress;
  } else {
    result = "unknown";
  }

  return result;
};

Traffic.prototype.getSourceMAC = function() {
  return this._senderMAC;
};

Traffic.prototype.getDestinationMAC = function() {
  return this._targetMAC;
};

Traffic.prototype.getPayload = function() {
  return this._payload;
};
