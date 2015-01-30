'''
	This file contains the unit test code for the Sniffer Class. 
	Sniffer is a class that handles the setup and execution
	of packet capturing on the network.

	Created on January 29th, 2015

	@author: Adam Brown
'''

import unittest 
import prod.Sniffer as Sniffer

class Test(unittest.TestCase):

	def setUp(self):
		self.s = Sniffer.Sniffer()

# Testing __init__
	#100_0xx happy path
	def test100_010(self):
		self.assertIsInstance(Sniffer.Sniffer(), Sniffer.Sniffer)

	def test100_011(self):
		self.assertIsInstance(Sniffer.Sniffer("en0"), Sniffer.Sniffer)

	def test100_012(self):
		self.assertIsInstance(Sniffer.Sniffer("en0", "icmp"), Sniffer.Sniffer)

	def test100_013(self):
		self.assertIsInstance(Sniffer.Sniffer("en0", "icmp", True), Sniffer.Sniffer)

	def test100_014(self):
		self.assertIsInstance(Sniffer.Sniffer("en0", "icmp", True, 1400), Sniffer.Sniffer)

	def test100_015(self):
		self.assertIsInstance(Sniffer.Sniffer("en0", "icmp", True, 1400, 110), Sniffer.Sniffer)

	#100_9xx sad path
	
# Testing setDevice
	def test200_010(self):
		self.assertEquals(True, self.s.setDevice("en0"))

	def test200_910(self):
		self.assertRaises(ValueError, self.s.setDevice, 14)

	def test200_920(self):
		self.assertRaises(ValueError, self.s.setDevice, "")

# Testing getDevice

# Testing __isDeviceValid
# 	def test400_010(self):
# 		self.assertEquals(True, self.s.isDeviceValid("en0"))

# 	def test400_020(self):
# 		self.assertEquals(False, self.s.isDeviceValid("Adam"))

# 	def test400_030(self):
# 		self.assertEquals(False, self.s.isDeviceValid("en"))


if __name__ == "__main__":
	unittest.main()