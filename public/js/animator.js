var stage = new createjs.Stage("trafficCanvas");

function getAnimatorSelfInstance(currentThis) {
  var self = undefined;

  if (currentThis.animator != undefined) {
    self = currentThis.animator; // currentThis references Window object
  } else {
    self = currentThis; // currentThis is the animator instance as needed
  }

  return self;
}

function Animator() {
  var self = getAnimatorSelfInstance(this);

  self.TOPOLOGY_RADIUS = 200;
  self.TOPOLOGY_CENTER_X = 440;
  self.TOPOLOGY_CENTER_Y = 20;
  self.REDRAW_FREQUENCY = 1000;

  self._nodesClassC = new Array();
  self._nodesExternal = new Array();
  self._redrawInterval = 0;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  if( self._redrawInterval > 0 ) clearInterval(self._redrawInterval);
  self._redrawInterval = setInterval(self._redrawNodes, self.REDRAW_FREQUENCY);
}

Animator.prototype.addNode = function(ip) {
  var self = getAnimatorSelfInstance(this);

  if (self._isClassC(ip) && !(ip in self._nodesClassC)) {
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
    stage.addChild(circle);
    self._nodesClassC[ip] = circle;
    self._redrawNodes();
  } else {
    self._nodesExternal[ip] = ip;
  }
};

Animator.prototype.update = function() {
  var self = getAnimatorSelfInstance(this);
  var arg = arguments[0];

  // If arg.add is present, we are being notified of a new network node
  //   we should add to our canvas.
  // If arg.traffic is present, we are being notified to visualize traffic.
  if (arg.add != undefined) {
    var node = arg.add;
    self.addNode(node.getIP());
  } else if (arg.traffic != undefined) {
    var traffic = arg.traffic;
    self.shootLaser(0,0,900,400);
  }
};

Animator.prototype.shootLaser = function(originX, originY, destX, destY) {
  var self = getAnimatorSelfInstance(this);
  var beam = new createjs.Shape();

  beam.graphics.beginFill("red");
  beam.graphics.moveTo(0,1.5).lineTo(70,0).lineTo(70,3).closePath();
  beam.x = originX;
  beam.y = originY;
  beam.setBounds(0,0,70,3);
  beam.rotation = self._slopeToDegrees(
    self._findSlope(originX, destX, originY, destY)
  );

  stage.addChildAt(beam, 0);

  createjs.Tween.get(beam, {loop: false, onChange: self._beamUpdate})
    .to({x: destX, y: destY, alpha: 0.25}, 1500, createjs.Ease.linear)
    .call(self._beamComplete);
};

Animator.prototype._beamUpdate = function(e) {
  var self = getAnimatorSelfInstance(this);
  var beam = e.currentTarget.target;
  var targetX = e.currentTarget._curQueueProps.x;

  // Make the beam grow smaller when target reached
  // * Needs updated
  /*if( targetX - beam.x < beam.getBounds().width ) {
    //beam.scaleX = (targetX - beam.x) / targetX;
  } else {
    //beam.scaleX = 1;
  }*/
};

Animator.prototype._beamComplete = function(e) {
  var self = getAnimatorSelfInstance(this);
  var beam = e.target;
  stage.removeChild(beam);
};

Animator.prototype._findSlope = function(x1, x2, y1, y2) {
  if (x1 == x2) {
    return 0;
  } else {
    return (y2 - y1) / (x2 - x1);
  }
};

Animator.prototype._slopeToDegrees = function(slope) {
  // slope to angle to degrees
  return Math.atan(slope) * (180/Math.PI);
};

Animator.prototype._isClassC = function(ip) {
  var firstOctet = Number(ip.substring(0,3));

  if (firstOctet >= 192 && firstOctet <= 223) {
    return true;
  } else {
    return false;
  }
};

Animator.prototype._redrawNodes = function() {
  var self = getAnimatorSelfInstance(this);
  var totalNodes = Object.keys(self._nodesClassC).length;
  var current = 0;
  var step = (Math.PI * 2) / totalNodes;

  for ( var node in self._nodesClassC ) {
    nodeGraphic = self._nodesClassC[node];
    var newX = self.TOPOLOGY_CENTER_X + self.TOPOLOGY_RADIUS * Math.sin(current);
    var newY = self.TOPOLOGY_CENTER_Y + self.TOPOLOGY_RADIUS * Math.cos(current);
    createjs.Tween.get(nodeGraphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    current += step;
  }
};
