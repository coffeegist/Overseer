var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var ProtocolExpert = require(_path.join(appPath, 'server', 'ProtocolExpert'));
var AddressUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'AddressUtilities')
);

function MessageBuilder() {
  var self = this;
  self._builder = undefined;
}

MessageBuilder.prototype.build = function(data, message) {
  var self = this;

  self._builder(data, message);
};

MessageBuilder.prototype.setBuilder = function(protocol) {
  var self = this;
  var protocolName = ProtocolExpert.getProtocolName(protocol);

  switch(protocolName.toUpperCase()) {
    case 'IPV4':
      self._builder = self._IPV4Builder;
      break;

    case 'ARP':
      self._builder = self._ARPBuilder;
      break;

    case 'ICMP':
      self._builder = self._ICMPBuilder;
      break;

    case 'TCP':
      self._builder = self._TCPBuilder;
      break;

    case 'UDP':
      self._builder = self._UDPBuilder;
      break;

    default:
      break;
  }
};

MessageBuilder.prototype._ARPBuilder = function(header, message) {
  var self = this;
  message.data.type = 'arp';

  var op = header.operation;
  if (op == 1) {
    message.data.opString = 'request';
  } else if (op == 2) {
    message.data.opString = 'reply';
  }

  message.data.hardwareType = header.htype;
  message.data.protocolType = header.ptype;
  message.data.operation = op;

  var pDelimiter = ':';
  var pHex = true;
  if (message.data.protocolType == 2048) { // IPv4
    pDelimiter = '.';
    pHex = false;
  }
  message.data.senderHardwareAddress =
    AddressUtilities.addressBufferToString(header.sender_ha.addr, header.hlen, ':', true);
  message.data.senderProtocolAddress =
    AddressUtilities.addressBufferToString(header.sender_pa.addr, header.plen, pDelimiter, pHex);
  message.data.targetHardwareAddress =
    AddressUtilities.addressBufferToString(header.target_ha.addr, header.hlen, ':', true);
  message.data.targetProtocolAddress =
    AddressUtilities.addressBufferToString(header.target_pa.addr, header.plen, pDelimiter, pHex);

  message.setSourceMAC(message.data.senderHardwareAddress);
  message.setSourceProtocolAddress(message.data.senderProtocolAddress);
  message.setTargetMAC(message.data.targetHardwareAddress);
  message.setTargetProtocolAddress(message.data.targetProtocolAddress);

  message.msg = message.data.senderProtocolAddress +
    " <-ARP " + message.data.opString + "-> " +
    message.data.targetProtocolAddress;
};

MessageBuilder.prototype._IPV4Builder = function(header, message) {
  var self = this;

  try {
    message.data.type = 'ip';
    message.data.sourceIP = header.saddr.toString();
    message.data.destIP = header.daddr.toString();
    message.data.protocol = header.protocol;
    message.data.payload = header.payload;

    message.setSourceProtocolAddress(message.data.sourceIP);
    message.setTargetProtocolAddress(message.data.destIP);

    self.setBuilder(message.data.protocol);
    self.build(message.data.payload, message);
  } catch (e) {
    console.log("MessageBuilder.IPV4Builder: ", e);
  }
};

MessageBuilder.prototype._ICMPBuilder = function(header, message) {
  message.msg =
    message.data.sourceIP + ' <-ICMP-> ' + message.data.destIP;
};

MessageBuilder.prototype._TCPBuilder = function(header, message) {
  message.data.sourcePort = header.sport;
  message.data.destPort = header.dport;

  message.msg =
    message.data.sourceIP + ':' + message.data.sourcePort +
    ' <-TCP-> ' +
    message.data.destIP + ':' + message.data.destPort;
};

MessageBuilder.prototype._UDPBuilder = function(header, message) {
  message.data.sourcePort = header.sport;
  message.data.destPort = header.dport;

  message.msg =
    message.data.sourceIP + ':' + message.data.sourcePort +
    ' <-UDP-> ' +
    message.data.destIP + ':' + message.data.destPort;
};

module.exports = MessageBuilder;
