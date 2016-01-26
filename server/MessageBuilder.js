function MessageBuilder() {
  var self = this;
  self.BUILDERS = {
    IPV4: 0,
    ARP: 1,
    ICMP: 2,
    TCP: 6,
    UDP: 17
  };

  self._builder = undefined;
}

MessageBuilder.prototype.build = function(data, message) {
  var self = this;

  return self._builder(data, message);
};

MessageBuilder.prototype.setBuilder = function(builder) {
  var self = this;

  switch(builder) {
    case self.BUILDERS.IPV4:
      self._builder = IPV4Builder;
      break;

    case self.BUILDERS.ARP:
      self._builder = ARPBuilder;
      break;

    case self.BUILDERS.ICMP:
      self._builder = ICMPBuilder;
      break;

    case self.BUILDERS.TCP:
      self._builder = TCPBuilder;
      break;

    case self.BUILDERS.UDP:
      self._builder = UDPBuilder;
      break;

    default:
      break;
  }
}

function ARPBuilder(header, message) {
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
  if (message.data.protocolType == 2048) { // IPv4
    pDelimiter = '.';
  }
  message.data.senderHardwareAddress =
    addressBufferToString(header.sender_ha.addr, header.hlen, ':');
  message.data.senderProtocolAddress =
    addressBufferToString(header.sender_pa.addr, header.plen, pDelimiter);
  message.data.targetHardwareAddress =
    addressBufferToString(header.target_ha.addr, header.hlen, ':');
  message.data.targetProtocolAddress =
    addressBufferToString(header.target_pa.addr, header.plen, pDelimiter);

  message.msg = message.data.senderProtocolAddress +
    " <-ARP " + message.data.opString + "-> " +
    message.data.targetProtocolAddress;
}

function IPV4Builder(header, message) {
  try {
    message.data.type = 'ip';
    message.data.sourceIP = header.saddr.toString();
    message.data.destIP = header.daddr.toString();
    message.data.protocol = header.protocol;
    message.data.payload = header.payload;
  } catch (e) {
    console.log("MessageBuilder.build: ", e);
  }
}

function ICMPBuilder(header, message) {
  // do nothing
}

function TCPBuilder(header, message) {
  message.data.sourcePort = header.sport;
  message.data.destPort = header.dport;

  message.msg =
    message.data.sourceIP + ':' + message.data.sourcePort +
    ' <-TCP-> ' +
    message.data.destIP + ':' + message.data.destPort;
}

function UDPBuilder(header, message) {
  message.data.sourcePort = header.sport;
  message.data.destPort = header.dport;

  message.msg =
    message.data.sourceIP + ':' + message.data.sourcePort +
    ' <-UDP-> ' +
    message.data.destIP + ':' + message.data.destPort;
}

function addressBufferToString(buffer, length, delimiter) {
  var result = '';

  for (var i=0; i<length; i++) {
    result += buffer[i] + delimiter;
  }

  result = result.substring(0, result.length - 1); // remove last delimiter
  return result;
}
module.exports = MessageBuilder;
