// Required Core Modules
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Required Custom Modules
var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var AddressUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'AddressUtilities')
);
var ProtocolExpert = require(_path.join(appPath, 'server', 'ProtocolExpert'));

function TrafficPackager() {
  EventEmitter.call(this);
}
util.inherits(TrafficPackager, EventEmitter);

TrafficPackager.prototype.packageTraffic = function(trafficData, trafficType) {
  var self = this;
  var trafficPackage = {};

  switch (trafficType.toLowerCase()) {
    case 'ipv4':
      trafficPackage = self._packageIPv4(trafficData);
      break;

    case 'ipv6':
      trafficPackage = self._packageIPv6(trafficData);
      break;

    case 'arp':
      trafficPackage = self._packageARP(trafficData);
      break;
  }

  self.emit('trafficPackageReady',  trafficPackage);
};

TrafficPackager.prototype._packageIPv4 = function(data) {
  try {
    var message = data.toString();
    var addresses = AddressUtilities.parseIPv4Addresses(message);
    var port = data.payload.dport || '';
    var serviceName = '';
    if (port !== '') {
      serviceName = ProtocolExpert.getServiceName(port, data.protocol);
      if (serviceName === 'unknown') {
        port = data.payload.sport;
        serviceName = ProtocolExpert.getServiceName(port, data.protocol);
      }
    }

    return {
      addresses: addresses,
      type: 'ipv4',
      msg: message,
      protocolName: ProtocolExpert.getProtocolName(data.protocol),
      port: port,
      serviceName: serviceName
    };
  } catch (e) {
    console.log('TrafficPackager._packageIPv4: ', e, data);
  }
};

TrafficPackager.prototype._packageIPv6 = function(data) {
  try {
    var message = data.toString();
    var addresses = AddressUtilities.parseIPv6Addresses(message);
    return {
      addresses: addresses,
      type: 'ipv6',
      msg: message
    };
  } catch (e) {
    console.log('TrafficPackager._packageIPv6: ', e, data);
  }
};

TrafficPackager.prototype._packageARP = function(data) {
  try {
    var message = data.toString();
    var addresses = AddressUtilities.parseIPv4Addresses(message);

    return {
      addresses: addresses,
      type: 'arp',
      msg: message
    };
  } catch (e) {
    console.log('TrafficPackager._packageArp: ', e, data);
  }
};

module.exports = TrafficPackager;
