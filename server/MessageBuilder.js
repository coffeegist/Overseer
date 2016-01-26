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
}

function UDPBuilder(header, message) {
  message.data.sourcePort = header.sport;
  message.data.destPort = header.dport;
}

module.exports = MessageBuilder;
