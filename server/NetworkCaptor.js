// Required Core Modules
var pcap = require('pcap');

// Required Custom Modules
var _path = require('path');
var appPath = _path.dirname(require.main.filename);
var Node = require(_path.join(appPath, 'server', 'Node'));
var NodeManager = require(_path.join(appPath, 'server', 'NodeManager'));
var SocketUtilities = require(
  _path.join(appPath, 'server', 'Utilities', 'SocketUtilities')
);

/* Constants */
var NC_IPV4 = 2048;
var NC_ARP = 2054;

function NetworkCaptor(io, options) {
  var self = this;
  var opts = options || {};
  self.device = opts.device || opts.Device || '';
  self.filter = opts.filter || opts.Filter || '';
  self._pcapSession = undefined;
  self._nodeManager = undefined;
  self._io = io;

  if (SocketUtilities.ioObjectIsValid(self._io)) {
    self._io.on('connection', function(socket) {
      self._handleSocketTraffic(socket)
    });

    self._nodeManager = new NodeManager(self._io);
  } else {
    throw new Error("IO parameter required.");
  }
}

NetworkCaptor.prototype.start = function() {
  var self = this;

  if (!SocketUtilities.ioObjectIsValid(self._io)) {
    throw new Error('Member\'s IO object is invalid.');
  }

  self._pcapSession = pcap.createSession(self.device, self.filter);

  self._pcapSession.on('packet', function(raw_packet){
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
    if (self._pcapSession.opened) {
      self._pcapSession.close();
    }
  } catch (e) {
    // console.log(e);
  }
};

NetworkCaptor.prototype._emitTrafficMessage = function(trafficEvent) {
  var self = this;
  try {
    self._io.sockets.emit('traffic', trafficEvent);
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
      var newNode = new Node(trafficMessage.data.sourceIP);
      self._nodeManager.addNode(newNode);
    }

    if (typeof trafficMessage.data.destIP !== "undefined") {
      var newNode = new Node(trafficMessage.data.destIP);
      self._nodeManager.addNode(newNode);
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

NetworkCaptor.prototype._handleSocketTraffic = function(socket) {
  var self = this;

  socket.on('startCapture', function() {
    self.start();
    self._io.sockets.emit('traffic', {
      msg:"<span style=\"color:red !important\">Starting Capture!</span>"
    });
  });

  socket.on('stopCapture', function() {
    self.stop();
    self._io.sockets.emit('traffic', {
      msg:"<span style=\"color:red !important\">Stopping Capture!</span>"
    });
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