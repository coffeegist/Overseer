// Required Modules
var cap = require('cap').Cap;
var decoders = require('cap').decoders;
var PROTOCOL = decoders.PROTOCOL;

var _bufferSize = 10 * 1024 * 1024;
var _buffer = new Buffer(65535);

function NetworkCaptor(io, options) {
  this.session = new cap();
  this.io = io;

  var opts = options || {};
  //console.log("Options: ", options);
  this.device = opts.device || opts.Device || '';
  this.filter = opts.filter || opts.Filter || '';
}

NetworkCaptor.prototype.start = function(io) {
  // Ignore traffic to this server.
  //this.filter = 'not ip host ' + getDeviceAddressIPv4(this.device);
  this.filter = '(ip host 192.168.1.101) and (ip host 192.168.1.115)';
  var linkType = this.session.open(this.device, this.filter,
    _bufferSize, _buffer);

  this.session.on('packet', function(nbytes, trunc) {

    try {
      console.log("got one");
      if(linkType == 'IEEE802_11_RADIO') {
        var ret = undefined;

        if(_buffer.readUInt8(54) == 08) { // 08 indicates IP
          ret = decoders.IPV4(_buffer, 56);
        //  console.log(ret);
        } else if(_buffer.readUInt8(66) == '08') {
          ret = decoders.IPV4(_buffer, 68);
        }

        if (ret != undefined) {
          io.sockets.emit('blast', {msg:'from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr});

          if (ret.info.protocol === PROTOCOL.IP.TCP) {
            var datalen = ret.info.totallen - ret.hdrlen;

            //console.log('Decoding TCP ...');
            io.sockets.emit('blast', {msg:'Decoding TCP ...'});

            ret = decoders.TCP(_buffer, ret.offset);
            //console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
            io.sockets.emit('blast', {msg:' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport});
            datalen -= ret.hdrlen;
            //console.log(_buffer.toString('binary', ret.offset, ret.offset + datalen));
            ////io.sockets.emit('blast', {msg:_buffer.toString('binary', ret.offset, ret.offset + datalen)});
          } else if (ret.info.protocol === PROTOCOL.IP.UDP) {
            ret = decoders.UDP(_buffer, ret.offset);
            //console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
            //console.log(_buffer.toString('binary', ret.offset, ret.offset + ret.info.length));

            io.sockets.emit('blast', {msg:' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport});
            //io.sockets.emit('blast', {msg:_buffer.toString('binary', ret.offset, ret.offset + ret.info.length)});
          } else {
            console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    /*if (ret.info.type === PROTOCOL.ETHERNET.IPV4) {
      //console.log('Decoding IPv4 ...');
      io.sockets.emit('blast', {msg:'Decoding IPv4 ...'});

      ret = decoders.IPV4(_buffer, ret.offset);
      //console.log('from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr);
      io.sockets.emit('blast', {msg:'from: ' + ret.info.srcaddr + ' to ' + ret.info.dstaddr});

      if (ret.info.protocol === PROTOCOL.IP.TCP) {
        var datalen = ret.info.totallen - ret.hdrlen;

        //console.log('Decoding TCP ...');
        io.sockets.emit('blast', {msg:'Decoding TCP ...'});

        ret = decoders.TCP(_buffer, ret.offset);
        //console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
        io.sockets.emit('blast', {msg:' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport});
        datalen -= ret.hdrlen;
        //console.log(_buffer.toString('binary', ret.offset, ret.offset + datalen));
        ////io.sockets.emit('blast', {msg:_buffer.toString('binary', ret.offset, ret.offset + datalen)});
      } else if (ret.info.protocol === PROTOCOL.IP.UDP) {
        //console.log('Decoding UDP ...');
        //io.sockets.emit('blast', {msg:'Decoding UDP ...'});

        ret = decoders.UDP(_buffer, ret.offset);
        //console.log(' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport);
        //console.log(_buffer.toString('binary', ret.offset, ret.offset + ret.info.length));

        //io.sockets.emit('blast', {msg:' from port: ' + ret.info.srcport + ' to port: ' + ret.info.dstport});
        //io.sockets.emit('blast', {msg:_buffer.toString('binary', ret.offset, ret.offset + ret.info.length)});
      } else {
        console.log('Unsupported IPv4 protocol: ' + PROTOCOL.IP[ret.info.protocol]);
      }
    } else {
      console.log('Unsupported Ethertype: ' + PROTOCOL.ETHERNET[ret.info.type]);
    }*/
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
