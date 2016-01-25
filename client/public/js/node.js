function Node(jsonNode) {
  this._ip = jsonNode.ip;
  this.graphic = undefined;
  this.x = 0;
  this.y = 0;
}

Node.prototype.getIP = function() {
  var self = this;

  return self._ip;
};
