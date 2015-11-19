var pcap = require('pcap');

pcap_session = pcap.createSession('mon0', /*'(ip host 192.168.1.101) and (*/'ip host 192.168.1.115');

pcap_session.on('packet', function(raw_packet){
  var packet = pcap.decode.packet(raw_packet);
  var payload = packet.payload.ieee802_11Frame.llc.payload;
  console.log('***');
  console.log(payload.saddr.toString(), ' <-', payload.protocolName, '-> ', payload.daddr.toString());
  console.log('***\n');

  console.log('\n', payload, '\n');
});
