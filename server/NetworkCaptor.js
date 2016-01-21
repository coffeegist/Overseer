// Required Modules
var pcap = require('pcap');
var NC_IPV4 = 2048;
var NC_ARP = 2054;

function NetworkCaptor(options) {
  var self = this;
  var opts = options || {};

  self.session = undefined;
  self._nodes = [];

  self.device = opts.device || opts.Device || '';
  self.filter = opts.filter || opts.Filter || '';
  self.io = opts.io || opts.IO || undefined;

  if (self._ioObjectIsValid()) {
    self.io.on('connection', function(socket) {
      self._handleSocketTraffic(socket)
    });
  }
}

NetworkCaptor.prototype.start = function() {
  var self = this;

  if (!self._ioObjectIsValid()) {
    throw new Error('Member\'s IO object is invalid.');
  }

  self.session = pcap.createSession(self.device, self.filter);

  self.session.on('packet', function(raw_packet){
    try {
      var packet = pcap.decode.packet(raw_packet);
      self._processGenericPacket(packet);
    } catch (e) {
      // To many errors. Use log for debug only.
      //console.log("NetworkCaptor.start: ", e);
    }
  });
};

NetworkCaptor.prototype.stop = function() {
  var self = this;

  try {
    if (self.session.opened) {
      self.session.close();
    }
  } catch (e) {
    // console.log(e);
  }
};

NetworkCaptor.prototype.sendDeviceList = function(socket) {
  var self = this;

  socket.emit('deviceList', {list: self._nodes});
};

NetworkCaptor.prototype._checkNode = function(ip) {
  var self = this;

  if ( !(self._nodes.indexOf(ip) > -1) ) {
    self._nodes.push(ip);
    self.io.sockets.emit('newNode', {ip:ip});
  }
};

NetworkCaptor.prototype._emitTrafficMessage = function(trafficEvent) {
  var self = this;
  try {
    self.io.sockets.emit('traffic', trafficEvent);
  } catch (e) {
    console.log("NetworkCaptor._emitTrafficMessage: ", e);
  }
};

NetworkCaptor.prototype._processGenericPacket = function(packet) {
  var self = this;

  try {
    var protocol = undefined;
    var trafficMessage = undefined;

    if (packet.payload.hasOwnProperty("ieee802_11Frame")) {
      if (self._isDataFrame(packet.payload.ieee802_11Frame)) {
        packet = packet.payload.ieee802_11Frame;
        protocol = self._getLLCProtocol(packet);
        if (protocol != undefined) {
          trafficMessage = self._buildTrafficMessage(protocol, packet);
        }
      }
    } else if (protocol = packet.payload.ethertype) { // Not in monitor mode
      trafficMessage = self._buildTrafficMessage(protocol, packet.payload);
    }

    if (typeof trafficMessage !== "undefined") {
      self._checkTrafficForNewNodes(trafficMessage);
      self._emitTrafficMessage(trafficMessage);
    }
  } catch (e) {
    console.log("NetworkCaptor._processGenericPacket: ", e);
  }
};

NetworkCaptor.prototype._isDataFrame = function (ieee80211Payload) {
  var result = false;

  try {
    if (ieee80211Payload.type == 2
        && ieee80211Payload.subType == 0
        && ieee80211Payload.flags.raw < 10) {
      result = true;
    }
  } catch (e) {
    console.log("NetworkCaptor._isDataFrame: ", e);
  } finally {
    return result;
  }
};


NetworkCaptor.prototype._getLLCProtocol = function (ieee80211Payload) {
  var llcProtocol = undefined;

  try {
    llcProtocol = ieee80211Payload.llc.type;
  } catch (e) {
    console.log("NetworkCaptor._getLLCProtocol: ", e);
  } finally {
    return llcProtocol;
  }
};

NetworkCaptor.prototype._buildTrafficMessage = function(ethertype, etherframe) {
  var self = this;
  var trafficMessage = {msg:'', data:{}};
  var packet = etherframe;

  try {
    trafficMessage.data.sourceMAC = self._bufferToMAC(packet.shost.addr);
    trafficMessage.data.destMAC = self._bufferToMAC(packet.dhost.addr);
    if (typeof packet.llc !== "undefined") { // Monitor mode
      packet = packet.llc;
    }

    switch(ethertype) {
      case NC_ARP:
        trafficMessage.msg = trafficMessage.data.sourceMAC +
          " <-ARP-> " +
          trafficMessage.data.destMAC;

        trafficMessage.data.type ='arp';
        trafficMessage.data.payload = packet.payload || undefined;
      break;

      case NC_IPV4:
        ipHeader = packet.payload;
        self._packageIpv4Data(ipHeader, trafficMessage);

        if (trafficMessage.data.protocol == 6
          || trafficMessage.data.protocol == 17) {
            trafficMessage.data.sourcePort = trafficMessage.data.payload.sport;
            trafficMessage.data.destPort = trafficMessage.data.payload.dport;
        }

        trafficMessage.msg =
          trafficMessage.data.sourceIP + ':' + trafficMessage.data.sourcePort +
          ' <-' + self._getProtocolName(trafficMessage.data.protocol) + '-> ' +
          trafficMessage.data.destIP + ':' + trafficMessage.data.destPort;
      break;

      default:
        trafficMessage.msg = "Unknown ethertype ", ethertype;
        trafficMessage.data = {type: 'unknown'};
      break;
    }
  } catch (e) {
    console.log("NetworkCaptor._buildTrafficMessage: ", e, packet);
  } finally {
    return trafficMessage;
  }
};

NetworkCaptor.prototype._checkTrafficForNewNodes = function(trafficMessage) {
  var self = this;

  if (typeof trafficMessage.data !== "undefined") {
    if (typeof trafficMessage.data.sourceIP !== "undefined") {
      self._checkNode(trafficMessage.data.sourceIP);
    }

    if (typeof trafficMessage.data.destIP !== "undefined") {
      self._checkNode(trafficMessage.data.destIP);
    }
  }
};

NetworkCaptor.prototype._packageIpv4Data = function(header, message) {
  message.data.type = 'ip';
  message.data.sourceIP = header.saddr.toString();
  message.data.destIP = header.daddr.toString();
  message.data.protocol = header.protocol;
  message.data.payload = header.payload;
};

NetworkCaptor.prototype._bufferToMAC = function(buffer) {
  var MAC_LENGTH = 6;
  var result = '';

  for (var i=0; i < MAC_LENGTH; i++) {
    result += buffer[i].toString(16);
    if (i+1 < MAC_LENGTH) {
      result += ':';
    }
  }

  return result;
};

NetworkCaptor.prototype._getProtocolName = function(protocolNumber) {
  var result = 'unknown';

  switch (protocolNumber) {
    case 1:
      result = 'ICMP';
      break;
    case 4:
      result = 'IPv4';
      break;
    case 6:
      result = 'TCP';
      break;
    case 17:
      result = 'UDP';
      break;
    default:
      break;
  }

  return result;
};

NetworkCaptor.prototype._ioObjectIsValid = function() {
  var self = this;
  var result = true;

  try {
    if (typeof self.io.sockets !== 'object') {
      result = false;
    }
  } catch (e) {
    result = false;
  } finally {
    return result;
  }
};

NetworkCaptor.prototype._handleSocketTraffic = function(socket) {
  var self = this;

  socket.on('startCapture', function() {
    self.start();
    self.io.sockets.emit('traffic', {msg:"<span style=\"color:red !important\">Starting Capture!</span>"});
  });

  socket.on('stopCapture', function() {
    self.stop();
    self.io.sockets.emit('traffic', {msg:"<span style=\"color:red !important\">Stopping Capture!</span>"});
  });

  socket.on('nodeListRequest', function() {
    self.sendDeviceList(socket);
  });
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
