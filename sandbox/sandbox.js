// Required Modules
var cap = require('cap').Cap;
var decoders = require('cap').decoders;
var PROTOCOL = decoders.PROTOCOL;

var radioparse = require("radioparse")

var _bufferSize = 10 * 1024 * 1024;
var _buffer = new Buffer(65535);

var session = new cap();
var device = "mon0";

var linkType = session.open(device, "",
  _bufferSize, _buffer);

session.on('packet', function(nbytes, trunc) {

  try {
    if(linkType == 'IEEE802_11_RADIO') {
      var packet = radioparse.parse(_buffer);

      if(_buffer.readUInt8(54) == 08) { // 08 indicates IP
        ret = decoders.IPV4(_buffer, 56);
        console.log(ret);
      }
    } else {
      console.log(linkType);
    }
  } catch(e) {
    console.log(e);
  }
});

/*var pcap = require("pcap")
var radioparse = require("radioparse")

var session = pcap.createSession("mon0")

session.on("packet", function(rawPacket) {
  var packet = radioparse.parse(radioparse.slice_packet(rawPacket))
  console.log(packet)
});
*/
