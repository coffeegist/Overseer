// Required Core Modules
var pcap = require('pcap');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function NetworkCaptor(options) {
  var self = this;
  EventEmitter.call(self);
  var opts = options || {};
  self.device = opts.device || opts.Device || '';
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

module.exports = NetworkCaptor;
