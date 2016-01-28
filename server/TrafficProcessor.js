var EventEmitter = require('events').EventEmitter;
var util = require('util');

var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var TrafficMessage = require(_path.join(appPath, 'server', 'TrafficMessage'));
var MessageBuilder = require(_path.join(appPath, 'server', 'MessageBuilder'));
var ProtocolExpert = require(_path.join(appPath, 'server', 'ProtocolExpert'));
var AddressUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'AddressUtilities')
);

function TrafficProcessor() {
  EventEmitter.call(this);
  this._mb = new MessageBuilder();
}
util.inherits(TrafficProcessor, EventEmitter);

TrafficProcessor.prototype.processGenericPacket = function(packet) {
  var self = this;

  try {
    var protocol = undefined;
    var trafficMessage = undefined;

    var po = self._preparePacket(packet);
    trafficMessage = self._buildTrafficMessage(po.protocol, po.packet);

    if (typeof trafficMessage !== "undefined") {
      self.emit('traffic', trafficMessage);
    }
  } catch (e) {
    console.log("TrafficProcessor._processGenericPacket: ", e);
  }
};

TrafficProcessor.prototype._preparePacket = function(packet) {
  var result = {protocol: undefined, packet: undefined};

  if (packet.payload.hasOwnProperty("ieee802_11Frame")) { // Monitor mode
    if (self._isDataFrame(packet.payload.ieee802_11Frame)) {
      result.packet = packet.payload.ieee802_11Frame;
      result.protocol = self._getLLCProtocol(packet);
    }
  } else { // Not in monitor mode
    if (result.protocol = packet.payload.ethertype) { // Not in monitor mode
      result.packet = packet.payload;
    }
  }

  return result;
};
TrafficProcessor.prototype._isDataFrame = function (ieee80211Payload) {
  var result = false;

  try {
    if (ieee80211Payload.type == 2
        && ieee80211Payload.subType == 0
        && ieee80211Payload.flags.raw < 10) {
      result = true;
    }
  } catch (e) {
    console.log("TrafficProcessor._isDataFrame: ", e);
  } finally {
    return result;
  }
};

TrafficProcessor.prototype._getLLCProtocol = function (ieee80211Payload) {
  var llcProtocol = undefined;

  try {
    llcProtocol = ieee80211Payload.llc.type;
  } catch (e) {
    console.log("TrafficProcessor._getLLCProtocol: ", e);
  } finally {
    return llcProtocol;
  }
};

TrafficProcessor.prototype._buildTrafficMessage = function(ethertype, etherframe) {
  var self = this;
  var trafficMessage = new TrafficMessage();
  var packet = etherframe;

  try {
    trafficMessage.data.sourceMAC = AddressUtilities.bufferToMAC(packet.shost.addr);
    trafficMessage.data.destMAC = AddressUtilities.bufferToMAC(packet.dhost.addr);
    if (typeof packet.llc !== "undefined") { // Monitor mode
      packet = packet.llc;
    }

    self._mb.setBuilder(ethertype);
    self._mb.build(packet.payload, trafficMessage);
  } catch (e) {
    console.log("TrafficProcessor._buildTrafficMessage: ", e, packet);
  } finally {
    return trafficMessage;
  }
};

module.exports = TrafficProcessor;
