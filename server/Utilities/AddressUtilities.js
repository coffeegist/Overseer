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

module.exports = AddressUtilities;
