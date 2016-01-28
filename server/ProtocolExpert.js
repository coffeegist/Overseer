var protocolNumbers = {
  'ICMP': 1,
  'IGMP': 2,
  'TCP': 6,
  'UDP': 17,
  'IPV4': 2048,
  'ARP': 2054
};
function ProtocolExpert() {}

ProtocolExpert.getProtocolNumber = function(name) {
  console.log(protocolNumbers);
  return protocolNumbers[name.toUpperCase()];
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

module.exports = ProtocolExpert;
