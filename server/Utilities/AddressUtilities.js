function AddressUtilities() {}

AddressUtilities.bufferToMAC = function(buffer) {
  var MAC_LENGTH = 6;
  var result = '';

  try {
    for (var i=0; i < MAC_LENGTH; i++) {
      result += buffer[i].toString(16);
      if (i+1 < MAC_LENGTH) {
        result += ':';
      }
    }
  } catch (e) {
    console.log("AddressUtilities.bufferToMAC: ", e);
  } finally {
    return result;
  }
};

AddressUtilities.validateIPv4Address = function(address) {
  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  var result = false;

  if(address.match(ipformat)) {
    result = true;
  }

  return result;
};

AddressUtilities.addressBufferToString = function(buffer, length, delimiter, toHex) {
  var result = '';

  for (var i=0; i<length; i++) {
    var seq = buffer[i];
    if (toHex) {seq = seq.toString(16)}
    result += seq + delimiter;
  }

  result = result.substring(0, result.length - 1); // remove last delimiter
  return result;
};

module.exports = AddressUtilities;
