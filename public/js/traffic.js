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
    } else if (packet.type == 'arp') {
      this._sourceMAC = packet.sourceMAC;
      this._destinationMAC = packet.destMAC;
      this._payload = packet.payload;
    }
  } catch(e) {
    // do nothing.
  }
}

Traffic.prototype.getType = function() {
  return this._type;
};

Traffic.prototype.getSourceIP = function() {
  return this._sourceIP;
};

Traffic.prototype.getDestinationIP = function() {
  return this._destinationIP;
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
