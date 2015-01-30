import pcap

def isDeviceValid(device):
	for newDevice in pcap.findalldevs():
		print newDevice[0]
		if device == newDevice[0]:
			return True

	return False

if __name__ == "__main__":
	print isDeviceValid("en0")

	print isDeviceValid("eth0")