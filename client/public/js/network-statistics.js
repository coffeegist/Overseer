var NetworkStatistics = (function() {
  var _serviceTrackingMap = [];

  var updateDOMProtocolInfo = function() {
    _serviceTrackingMap.sort(function(a, b) {
        return b.count - a.count;
    });

    for (var i=Math.min(5,_serviceTrackingMap.length); i-- ;) {
      $('#service' + i).html('<strong>' + _serviceTrackingMap[i].serviceName + '</strong>');
      $('#count' + i).html('<strong>' + _serviceTrackingMap[i].count + '</strong>');
      $('#port' + i).html('<strong>' + _serviceTrackingMap[i].port + '</strong>');
    }
  };

  return {
    addServiceCount : function(serviceName, port) {
      var element = undefined;
      for (var i=_serviceTrackingMap.length; i-- ;) {
        if (_serviceTrackingMap[i].port === port) {
          element = _serviceTrackingMap[i];
          break;
        }
      }

      if (typeof element === 'undefined') {
        _serviceTrackingMap.push({
          serviceName: serviceName,
          count: 1,
          port: port
        });
      } else {
        element.count++;
      }

      updateDOMProtocolInfo();
    }
  };
})();
