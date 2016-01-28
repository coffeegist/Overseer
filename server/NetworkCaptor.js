// Required Core Modules
var pcap = require('pcap');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Required Custom Modules
var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var MessageBuilder = require(_path.join(appPath, 'server', 'MessageBuilder'));
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

  try {
    self._pcapSession = pcap.createSession(self.device, self.filter);

    self._pcapSession.on('packet', function(raw_packet){
      try {
        var packet = pcap.decode.packet(raw_packet);
        self._sendMessage('newPacket', packet);
      } catch (e) {
        // Too many errors. Use log for debug only.
        //console.log("NetworkCaptor.start: ", e);
      }
    });
  } catch (e) {
    self._sendMessage('error', {error: e.message});
  }
};

NetworkCaptor.prototype.stop = function() {
  var self = this;

  try {
    if (self._pcapSession.opened) {
      self._pcapSession.close();
    }
  } catch (e) {
    self._sendMessage('error', {error: e.message});
  }
};

NetworkCaptor.prototype._sendMessage = function(signal, data) {
  var self = this;

  try {
    self.emit(signal, data);
  } catch (e) {
    console.log("NetworkCaptor._sendMessage: ", e);
  }
};

NetworkCaptor.prototype._handleSocketTraffic = function(socket) {
  var self = this;

  try {
    socket.on('startCapture', function() {
      self.start();
      self._sendMessage('traffic', {
        msg:"<span style=\"color:red !important\">Starting Capture!</span>"
      });
    });

    socket.on('stopCapture', function() {
      self.stop();
      self._sendMessage('traffic', {
        msg:"<span style=\"color:red !important\">Stopping Capture!</span>"
      });
    });
  } catch (e) {
    self._sendMessage('error', {error: e.message});
  }
};

function ValidateIPaddress(address) {
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if(address.match(ipformat)) {
    return true;
  } else {
    return false;
  }
}

function getDeviceAddressIPv4(targetDevice) {
  var result = 'unknown';
  cap.deviceList().forEach(function(device) {
    if( device.name === targetDevice ) {
      device.addresses.forEach(function(address) {
        if( ValidateIPaddress(address.addr)) {
          result = address.addr;
        }
      });
    }
  });

  return result;
}

module.exports = NetworkCaptor;
