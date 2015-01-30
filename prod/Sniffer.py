'''
	This file contains the class definition for Sniffer. 
	Sniffer is a class that handles the setup and execution
	of packet capturing on the network.

	Created on January 29th, 2015

	@author: Adam Brown
'''

import pcap


class Sniffer:

	''' 
	Function:	__init__
	Purpose: 	Allows the user to instantiate an instance of the Sniffer class.
	
	Parameters: 
	 	device: 		String determining the name of the device - arrives unvalidated.
	 	filter:			An expression used to filter incoming traffic that will be captured by device - arrives unvalidated.
	 	promiscuous:	A boolean to determine whether to capture in promiscuous mode or not - arrives unvalidated.
	 	snaplen:		An integer determining the maximum length to capture at a time - arrives unvalidated.
	 	to_ms:			A timeout value in milliseconds for the capture device.

	Returns:	An instance of Sniffer
	'''
	def __init__(self, device=None, filter=None, promiscuous=False, snaplen=1600, to_ms=100):
		
		self.__sDevice = None
		self.__sFilter = ""
		self.__bPromiscuous = False
		self.__iSnapLen = 1600
		self.__iTimeout = 100

		if( device != None ):
			if( not isinstance( device, basestring) or len(device.strip()) == 0 ):
				raise ValueError("Sniffer.__init__:  Device must be a non-empty device name that exists on this machine.")

			if( self.__isDeviceValid(device) ):
				self.__sDevice == device

		if( filter != None ):
			if( not isinstance( filter, basestring) ):
				raise ValueError("Sniffer.__init__:  Filter expression must be a string.")

			self.__sFilter = filter

		if( promiscuous != False ):
			if( not isinstance( promiscuous, bool) ):
				raise ValueError("Sniffer.__init__:  Promiscuous must be a boolean.")

			self.__bPromiscuous = promiscuous

		if( snaplen != 1600 ):
			if( not isinstance( snaplen, int) ):
				raise ValueError("Sniffer.__init__:  Snaplen must be an integer.")

			self.__iSnapLen = snaplen

		if( to_ms != 100 ):
			if( not isinstance( to_ms, int) ):
				raise ValueError("Sniffer.__init__:  Timeout must be an integer represented in milliseconds.")

			self.__iTimeout = to_ms


	''' 
	Function:	setDevice
	Purpose: 	Allows the user to change the capture device in use.
	
	Parameters: 
	 	device: String determining the name of the device - arrives unvalidated.

	Returns:	True if setting the device was successful, False otherwise
	'''
	def setDevice(self, device):
		if( not isinstance( device, basestring) or len(device.strip()) == 0 ):
			raise ValueError("Sniffer.setDevice:  Device must be a non-empty string.")

		if self.__isDeviceValid(device):
			self.__sDevice = device
			return True

		return False


	''' 
	Function:	getDevice
	Purpose: 	Provides a string name of the device being used
	
	Parameters: None

	Returns:	The current name of the device being used.
	'''
	def getDevice(self):
		return self.__sDevice


	''' 
	Function:	isDeviceValid
	Purpose: 	Determines whether the device exists and is able to capture from.
	
	Parameters: 
	 	device: String determining the name of the device - arrives validated.

	Returns:	True if the device is found and useful, False otherwise
	'''
	def __isDeviceValid(self, device):

		for newDevice in pcap.findalldevs():
			if device == newDevice[0]:
				return True

		return False