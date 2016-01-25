var _path = require('path');
var appPath = _path.dirname(require.main.filename);

var SocketMessengerFactory = require(_path.join(appPath, 'server', 'SocketMessengerFactory'));
var NetworkCaptor = require(_path.join(appPath, 'server', 'NetworkCaptor'));

module.exports = function(app) {
  try {
    var socketMessenger = SocketMessengerFactory(app);
    var networkCaptor = new NetworkCaptor(socketMessenger.io, {device: 'wlan0'});

    return {
      socketMessenger: socketMessenger,
      networkCaptor: networkCaptor
    };
  } catch(e) {
    console.log('SessionManagerFactory: ', e);
  }
};
