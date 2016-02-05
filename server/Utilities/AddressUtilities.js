var ipaddr = require('ipaddr.js');

function AddressUtilities() {}

AddressUtilities.bufferToMAC = function(buffer) {
  var result = '';

  try {
    for (var i=0; i < buffer.length; i++) {
      result += buffer[i].toString(16);
      if (i+1 < buffer.length) {
        result += ':';
      }
    }
  } catch (e) {
    console.log("AddressUtilities.bufferToMAC: ", e);
  } finally {
    return result;
  }
};

AddressUtilities.bufferToIP = function(buffer) {
  var result = '';

  try {
    result = ipaddr.fromByteArray(buffer).toString();
  } catch (e) {
    console.log("AddressUtilities.bufferToIPV6: ", e);
  } finally {
    return result;
  }
};

AddressUtilities.isValidIP = function(address) {
  return ipaddr.isValid(address);
};

AddressUtilities.parseIPv4Addresses = function(data) {
  return data.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
};

AddressUtilities.parseIPv6Addresses = function(data) {
  return data.match(/\b([0-9a-fA-F]|:){1,4}(:([0-9a-fA-F]{0,4})*){1,7}\b/g);
};

AddressUtilities.parseMACAddresses = function(data) {
  return data.match(/\b([0-9a-fA-F]{2}\:){5}[0-9a-fA-F]{2}\b/g);
};

module.exports = AddressUtilities;
