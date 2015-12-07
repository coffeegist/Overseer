// Required Modules
var pcap = require('pcap');

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

NetworkCaptor.prototype.start = function(io) {
  var self = this;
  // Ignore traffic to this server.
  //this.filter = 'not ip host ' + getDeviceAddressIPv4(this.device);
  //this.filter = '(ip host 192.168.1.100) and (ip host 192.168.1.115)';
  self.session = pcap.createSession(self.device, self.filter);

  self.session.on('packet', function(raw_packet){
    try {
        var packet = pcap.decode.packet(raw_packet);
        var payload = packet.payload.ieee802_11Frame.llc.payload;
        console.log(payload);

        self._checkNode(payload.saddr.toString());
        self._checkNode(payload.daddr.toString());
        
        io.sockets.emit('traffic', {
          msg: payload.saddr.toString() + ':' + payload.payload.sport +
            ' <-' + payload.protocolName + '-> ' +
            payload.daddr.toString() + ':' + payload.payload.dport
        });
    } catch (e) {
      console.log(e);
    }
  });
}

NetworkCaptor.prototype.stop = function() {
  this.session.close();
}

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
