function SocketUtilities() {}

SocketUtilities.ioObjectIsValid = function(io) {
  var result = true;

  try {
    if (typeof io.sockets !== 'object') {
      result = false;
    }
  } catch (e) {
    result = false;
  } finally {
    return result;
  }
};

module.exports = SocketUtilities;
