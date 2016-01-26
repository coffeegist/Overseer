function Traffic(packet) {
  try {
    this._type = packet.type;

    if (packet.type == 'ip') {
      this._sourceIP = packet.sourceIP;
      this._destinationIP = packet.destIP;
      this._sourceMAC = packet.sourceMAC;
      this._destinationMAC = packet.destMAC;
      this._sourcePort = packet.sourcePort;
      this._destinationPort = packet.destPort;
      this._payload = packet.payload;
      this._color = "red";
    } else if (packet.type == 'arp') {
      this._sourceMAC = packet.sourceMAC;
      this._destinationMAC = packet.destMAC;
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

  if (self._type == 'ip') {
    result = self._sourceIP;
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

  if (self._type == 'ip') {
    result = self._destinationIP;
  } else if (self._type == 'arp') {
    result = self._targetProtocolAddress;
  } else {
    result = "unknown";
  }

  return result;
};

Traffic.prototype.getSourceMAC = function() {
  return this._sourceMAC;
};

Traffic.prototype.getDestinationMAC = function() {
  return this._destinationMAC;
};

Traffic.prototype.getPayload = function() {
  return this._payload;
};
