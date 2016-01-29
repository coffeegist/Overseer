// Required Core Modules
var pcap = require('pcap');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Required Custom Modules
var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var MessageBuilder = require(_path.join(appPath, 'server', 'MessageBuilder'));
var AddressUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'AddressUtilities')
);
var SocketUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'SocketUtilities')
);

function NetworkCaptor(options) {
  var self = this;
  EventEmitter.call(self);
  var opts = options || {};
  self.device = opts.device || opts.Device || '';
  self.filter = opts.filter || opts.Filter || '';
  self._pcapSession = undefined;
  self._mb = new MessageBuilder();
}
util.inherits(NetworkCaptor, EventEmitter);

NetworkCaptor.prototype.start = function() {
  var self = this;
  var result = false;

  try {
    self._pcapSession = pcap.createSession(self.device, self.filter);

    self._pcapSession.on('packet', function(raw_packet){
      try {
        var packet = pcap.decode.packet(raw_packet);
        self.emit('newPacket', packet);
      } catch (e) {
        // Too many errors. Use log for debug only.
        //console.log("NetworkCaptor.start: ", e);
      }
    });

    result = true;
  } catch (e) {
    self.emit('error', {error: e.message});
  } finally {
    return result;
  }
};

NetworkCaptor.prototype.stop = function() {
  var self = this;
  var result = false;

  try {
    if (self._pcapSession.opened) {
      self._pcapSession.close();
      result = true;
    }
  } catch (e) {
    self.emit('error', {error: e.message});
  } finally {
    return result;
  }
};

function getDeviceIPAddress(targetDevice) {
  var result = 'unknown';
  cap.deviceList().forEach(function(device) {
    if( device.name === targetDevice ) {
      device.addresses.forEach(function(address) {
        if( AddressUtilities.isValidIP(address.addr)) {
          result = address.addr;
        }
      });
    }
  });

  return result;
}

module.exports = NetworkCaptor;
