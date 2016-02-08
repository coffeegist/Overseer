var NetworkStatistics = (function() {
  var _serviceTrackingMap = [];

  var updateDOMProtocolInfo = function() {
    _serviceTrackingMap.sort(function(a, b) {
        return b.count - a.count;
    });

    for (var i=Math.min(5,_serviceTrackingMap.length); i-- ;) {
      var serviceName = $('#service' + i);
      var count = $('#count' + i);
      serviceName.html('<strong>' + _serviceTrackingMap[i].serviceName + '</strong>');
      count.html('<strong>' + _serviceTrackingMap[i].count + '</strong>');
    }
  };

  return {
    addServiceCount : function(serviceName) {
      var element = undefined;
      for (var i=_serviceTrackingMap.length; i-- ;) {
        if (_serviceTrackingMap[i].serviceName === serviceName) {
          element = _serviceTrackingMap[i];
          break;
        }
      }

      if (typeof element === 'undefined') {
        _serviceTrackingMap.push({
          serviceName: serviceName,
          count: 1
        });
      } else {
        element.count++;
      }

      updateDOMProtocolInfo();
    }
  };
})();
