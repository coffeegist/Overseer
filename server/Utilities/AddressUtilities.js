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


module.exports = AddressUtilities;
