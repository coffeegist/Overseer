import pcap
from construct.protocols.ipstack import ip_stack

def print_packet(pktlen, data, timestamp):
    if not data:
        return

    stack = ip_stack.parse(data)
    #payload = stack.next.next.next for port 80 traffic
    #print payload
    print stack


p = pcap.pcapObject()
p.open_live('en0', 1600, 0, 100)
#p.setfilter('dst port 80', 0, 0)

print 'Press CTRL+C to end capture'
try:
    while True:
        p.dispatch(1, print_packet)
except KeyboardInterrupt:
    print # Empty line where ^C from CTRL+C is displayed
    print '%d packets received, %d packets dropped, %d packets dropped by interface' % p.stats()