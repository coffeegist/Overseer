function Subject() {
  this._observers = [];
}

Subject.prototype.registerObserver = function(observer) {
  this._observers.push(observer);
};

Subject.prototype.deregisterObserver = function(observer) {
  var index = this._observers.indexOf(observer);

  if (index > -1) {
    this._observers.splice(index, 1);
  }
};

Subject.prototype.notify = function() {
  var args = Array.prototype.slice.call(arguments, 0);

  for (var i=0; i < this._observers.length; i++) {
    this._observers[i].update.apply(null, args);
  }
};
