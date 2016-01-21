var socketio = require('socket.io');

module.exports = function(app) {
  var socketMessenger = {};
  var signalHandler = [];

  var io = socketio.listen(app);

  io.sockets.on('connection', function (socket) {
    socket.emit('traffic', {
      msg:"<span style=\"color:red !important\">Connected to Server</span>",
      data: {type: 'sys'}
    });
  });

  socketMessenger.io = io;
  socketMessenger.use = function(obj, signalsArray)  {
    for (var i=0; i<signalsArray.length; i++) {
      signalHandler[signalsArray[i]] = obj;
    }
  };

  return socketMessenger;
};
