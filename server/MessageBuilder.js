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

  if (protocolName != undefined) {
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

      case 'IPV6':
        self._builder = self._IPV6Builder;
        break;

      default:
        break;
    }
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

  message.data.senderHardwareAddress =
    AddressUtilities.bufferToMAC(header.sender_ha.addr);
  message.data.senderProtocolAddress =
    AddressUtilities.bufferToIP(header.sender_pa.addr);
  message.data.targetHardwareAddress =
    AddressUtilities.bufferToMAC(header.target_ha.addr);
  message.data.targetProtocolAddress =
    AddressUtilities.bufferToIP(header.target_pa.addr);

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
    message.data.type = 'ipv4';
    message.data.sourceIP = header.saddr.toString();
    message.data.destIP = header.daddr.toString();
    message.data.protocol = header.protocol;
    message.data.payload = header.payload;

    message.setSourceProtocolAddress(message.data.sourceIP);
    message.setTargetProtocolAddress(message.data.destIP);

    self.setBuilder(message.data.protocol);
    self.build(message.data.payload, message);
  } catch (e) {
    console.log("MessageBuilder._IPV4Builder: ", e);
  }
};

MessageBuilder.prototype._IPV6Builder = function(header, message) {
  var self = this;

  try {
    message.data.type = 'ipv6';
    message.data.sourceIP = AddressUtilities.bufferToIP(header.saddr.addr);
    message.data.destIP = AddressUtilities.bufferToIP(header.daddr.addr);
    message.data.protocol = header.nextHeader;
    message.data.payload = header.payload;

    message.setSourceProtocolAddress(message.data.sourceIP);
    message.setTargetProtocolAddress(message.data.destIP);

    self.setBuilder(message.data.protocol);
    self.build(message.data.payload, message);
  } catch (e) {
    console.log("MessageBuilder._IPV6Builder: ", e,header);
    throw(e);
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
