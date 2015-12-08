// Required Modules
var pcap = require('pcap');
var NC_IPV4 = 2048;
var NC_ARP = 2054;

function NetworkCaptor(io, options) {
  this.session = undefined;
  this.io = io;
  this._nodes = [];

  var opts = options || {};
  //console.log("Options: ", options);
  this.device = opts.device || opts.Device || '';
  this.filter = opts.filter || opts.Filter || '';
}

NetworkCaptor.prototype._checkNode = function(ip) {
  var self = this;

  if ( !(self._nodes.indexOf(ip) > -1) ) {
    self._nodes.push(ip);
    self.io.sockets.emit('newNode', {ip:ip});
    console.log("Nodes: ", self._nodes);
  }
};

NetworkCaptor.prototype._emitTrafficMessage = function(source, sPort, dest, dPort) {
  var self = this;
  var protocolName = "unknown";

  try {
    self.io.sockets.emit('traffic', {
      msg: source + ':' + sPort +
        ' <-' + protocolName + '-> ' +
        dest + ':' + dPort
    });
  } catch (e) {
    console.log(e);
  }
};

NetworkCaptor.prototype.start = function(io) {
  var self = this;
  // Ignore traffic to this server.
  //this.filter = 'not ip host ' + getDeviceAddressIPv4(this.device);
  //this.filter = '(ip host 192.168.1.100) and (ip host 192.168.1.115)';
  self.session = pcap.createSession(self.device, self.filter);

  self.session.on('packet', function(raw_packet){
    try {
        var packet = pcap.decode.packet(raw_packet);
        self._processGenericPacket(packet);
    } catch (e) {
      console.log(e);
    }
  });
}

NetworkCaptor.prototype.stop = function() {
  var self = this;

  if (self.session.opened) {
    self.session.close();
  }
}

NetworkCaptor.prototype._processGenericPacket = function(packet) {
  var self = this;

  try {
    var ethertype = null;

    if (ethertype = packet.payload.ethertype) {
      switch(ethertype) {
        case NC_ARP:
        break;

        case NC_IPV4:
          var packet = packet.payload;
          self._checkNode(packet.payload.saddr.toString());
          self._checkNode(packet.payload.daddr.toString());

          self._emitTrafficMessage(
            packet.payload.saddr.toString(),
            packet.payload.payload.sport,
            packet.payload.daddr.toString(),
            packet.payload.payload.dport
          );
        break;

        default:
          console.log(ethertype);
        break;
      }
    } else {
      var payload = null;

      if (payload = packet.payload.ieee802_11Frame.llc.payload) {
        console.log("Payload: ", payload);

        self._checkNode(payload.saddr.toString());
        self._checkNode(payload.daddr.toString());

        self._emitTrafficMessage(
          payload.saddr.toString(),
          payload.payload.sport,
          payload.daddr.toString(),
          payload.payload.dport
        );
      }
    }
  } catch (e) {
    console.log(e);
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
