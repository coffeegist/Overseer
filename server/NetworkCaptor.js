// Required Core Modules
var pcap = require('pcap');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var spawn = require('child_process').spawn;
var commandExists = require('command-exists');

function NetworkCaptor(options) {
  var self = this;
  EventEmitter.call(self);
  var opts = options || {};
  self.device = opts.device || opts.Device || self.getFirstDevice();
  self.filter = opts.filter || opts.Filter || '';
  self._pcapSession = undefined;
}
util.inherits(NetworkCaptor, EventEmitter);

NetworkCaptor.prototype.start = function() {
  var self = this;
  var result = false;

  try {
    self._pcapSession = pcap.createSession(self.device, self.filter);

    self._pcapSession.on('packet', function(raw_packet){
      try {
        pcap.decode(raw_packet, self);
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

NetworkCaptor.prototype.setDevice = function(name) {
  var self = this;

  if (self._pcapSession && self._pcapSession.opened) {
    self.emit('error', {error: "Unable to update device while capturing."});
  } else {
    self.device = name;
  }
};

NetworkCaptor.prototype.getDeviceSettings = function () {
  var self = this;
  var result = {name: self.device, address: []};
  var devices = pcap.findalldevs();

  for (var i=0; i<devices.length; i++) {
    if (devices[i].name == self.device) {
      for (var j=0; j<devices[i].addresses.length; j++) {
        try {
          result.address.push([
            devices[i].addresses[j].addr,
            devices[i].addresses[j].netmask
          ]);
        } catch (e) {
          // empty address, no worry
        }
      }
    }
  }

  return result;
};

NetworkCaptor.prototype.getFirstDevice = function () {
  return pcap.findalldevs()[0].name;
};

NetworkCaptor.prototype.getDeviceList = function() {
  var self = this;
  devList = pcap.findalldevs();
  result = [];

  for( var i=0; i < devList.length; i++) {
    var selected = (devList[i].name == self.device) ? true : false
    result.push({name: devList[i].name, selected: selected});
  }

  return result;
};

NetworkCaptor.prototype.enableMonitorMode = function() {
  var self = this;
  self._doAirmonCommand('start');
};

NetworkCaptor.prototype.disableMonitorMode = function() {
  var self = this;
  self._doAirmonCommand('stop');
};

NetworkCaptor.prototype._doAirmonCommand = function(command) {
  var self = this;

  commandExists('airmon-ng', function(err, airmon) {
    if (airmon) {
      var airmon_ng_start = spawn('airmon-ng', [command, self.device], {silent: true})
      .on('error', function(err) {
        return false;
      })
      .on('close', function(code, signal) {
        self.emit('airmon-finished');
        return true;
      });
    } else {
      self.emit('error', {error: "airmon-ng must be installed to change monitor mode."});
    }
  });
};

module.exports = NetworkCaptor;
