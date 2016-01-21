var appPath = require('path').dirname(require.main.filename);

var SocketMessengerFactory = require(appPath + '/server/SocketMessengerFactory');
var NetworkCaptor = require(appPath + '/server/NetworkCaptor/NetworkCaptor');

module.exports = function(app) {
  var socketMessenger = SocketMessengerFactory(app);
  var networkCaptor = new NetworkCaptor({io: socketMessenger.io, device: 'wlan0'});

  return {
    socketMessenger: socketMessenger,
    networkCaptor: networkCaptor
  };
};
