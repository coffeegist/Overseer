function TrafficManager() {
  this._subject = new Subject();
}

TrafficManager.prototype.addObserver = function(observer) {
  this._subject.registerObserver(observer);
};

TrafficManager.prototype.removeObserver = function(observer) {
  this._subject.deregisterObserver(observer);
};

TrafficManager.prototype.processTraffic = function(traffic) {
  this._subject.notify({traffic: traffic});
};
