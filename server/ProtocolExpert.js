var _path = require('path');
var appPath = _path.dirname(require.main.filename);

var tcpInfo = require(_path.join(appPath, 'server', 'ProtocolBase', 'TCPPortInfo'));
var udpInfo = require(_path.join(appPath, 'server', 'ProtocolBase', 'UDPPortInfo'));

var protocolNumbers = {
  'icmp': 1,
  'igmp': 2,
  'tcp': 6,
  'udp': 17,
  'ipv4': 2048,
  'ipv6': 34525,
  'arp': 2054
};

function ProtocolExpert() {}

ProtocolExpert.getProtocolNumber = function(name) {
  return protocolNumbers[name.toLowerCase()];
};

ProtocolExpert.getProtocolName = function(number) {
  var result = undefined;

  for (var prop in protocolNumbers) {
    if (protocolNumbers.hasOwnProperty(prop)) {
      if (protocolNumbers[prop] === number) {
        result = prop;
        break;
      }
    }
  }

  return result;
};

ProtocolExpert.getPortNumber = function(name, protocolNumber) {
  var result = '';

  if (protocolNumber == protocolNumbers['tcp']) {
    result = tcpInfo[name.toLowerCase()];
  } else if (protocolNumber == protocolNumbers['udp']) {
    result = udpInfo[name.toLowerCase()];
  }

  return result;
};

ProtocolExpert.getServiceName = function(number, protocolNumber) {
  var result = 'unknown';
  var protocolInfo;

  if (protocolNumber == protocolNumbers['tcp']) {
    protocolInfo = tcpInfo;
  } else if (protocolNumber == protocolNumbers['udp']) {
    protocolInfo = udpInfo;
  }

  for (var prop in protocolInfo) {
    if (protocolInfo.hasOwnProperty(prop)) {
      if (protocolInfo[prop] === number) {
        result = prop;
        break;
      }
    }
  }

  return result;
};

module.exports = ProtocolExpert;
