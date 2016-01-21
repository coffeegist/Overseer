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
  self.TOPOLOGY_CENTER_X = 470;
  self.TOPOLOGY_CENTER_Y = 250;
  self.TOPOLOGY_WIDTH = 940;
  self.TOPOLOGY_HEIGHT = 500;
  self.REDRAW_FREQUENCY = 1000;

  self._nodesClassC = new Array();
  self._nodesExternal = new Array();
  self._redrawInterval = 0;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  self._drawRouter();

  if( self._redrawInterval > 0 ) clearInterval(self._redrawInterval);
  self._redrawInterval = setInterval(self._redrawNodes, self.REDRAW_FREQUENCY);
}

Animator.prototype.addNode = function(ip) {
  var self = getAnimatorSelfInstance(this);

  if (self._isClassC(ip) && !(ip in self._nodesClassC)) {
    var newNode = self._createNodeGraphic(ip);
    stage.addChild(newNode);
    self._nodesClassC[ip] = {graphic: newNode, x: 0, y: 0};
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
    self.displayTraffic(traffic.getSourceIP(), traffic.getDestinationIP());
  }
};

Animator.prototype.displayTraffic = function(sourceAddr, destAddr) {
  var self = getAnimatorSelfInstance(this);
  var originX = 0, originY = 0;
  var destX = 0, destY = 0;

  /* Calculate origin and destination x,y coordinates */
  if (sourceAddr in self._nodesClassC) {
    originX = self._nodesClassC[sourceAddr].x;
    originY = self._nodesClassC[sourceAddr].y;
  } else {
    originX = self.TOPOLOGY_WIDTH / 2;
    originY = self.TOPOLOGY_HEIGHT / 2;
  }

  if (destAddr in self._nodesClassC) {
    destX = self._nodesClassC[destAddr].x;
    destY = self._nodesClassC[destAddr].y;
  } else {
    destX = self.TOPOLOGY_WIDTH / 2;
    destY = self.TOPOLOGY_HEIGHT / 2;;
  }

  /* Draw laser */
  var beam = new createjs.Shape();
  beam.graphics.beginFill("red");
  beam.graphics.moveTo(0, 1.5).lineTo(70, 0).lineTo(70, 3).closePath();
  beam.x = originX;
  beam.y = originY;
  beam.setBounds(0,0,70,3);
  beam.rotation = self._getTrafficRotation(originX, destX, originY, destY);

  /* Draw mask */
  var mask = new createjs.Shape();
  mask.graphics.s("#f00")
    .moveTo(originX,originY)
    .lineTo(originX, originY+10).lineTo(destX, destY+10)
    .lineTo(destX, destY-10).lineTo(originX, originY-10).closePath();
  beam.mask = mask;

  stage.addChildAt(beam, 0);

  createjs.Tween.get(beam, {loop: false, onChange: self._beamUpdate})
    .to({x: destX, y: destY, alpha: 1}, 1500, createjs.Ease.linear)
    .call(self._beamComplete);
};

Animator.prototype._beamUpdate = function(e) {
  /* Stub for future use */
};

Animator.prototype._beamComplete = function(e) {
  var self = getAnimatorSelfInstance(this);
  var beam = e.target;
  stage.removeChild(beam);
};

Animator.prototype._createNodeGraphic = function(ip) {
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 25);

  var text = new createjs.Text(ip, "10px Times New Roman", "#000");
  text.x = 0;
  text.y = 30; // radius of circle plus 5px white space
  text.textAlign = "center";

  var container = new createjs.Container();
  container.addChild(circle);
  container.addChild(text);

  return container;
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
    nodeGraphic = self._nodesClassC[node].graphic;
    var newX = self.TOPOLOGY_CENTER_X + self.TOPOLOGY_RADIUS * Math.cos(current);
    var newY = self.TOPOLOGY_CENTER_Y + self.TOPOLOGY_RADIUS * Math.sin(current);
    createjs.Tween.get(nodeGraphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    self._nodesClassC[node].x = newX;
    self._nodesClassC[node].y = newY;
    current += step;
  }
};

Animator.prototype._drawRouter = function() {
  var self = getAnimatorSelfInstance(this);
  var router = new createjs.Shape();
  router.graphics.beginFill("Black")
    .drawCircle(self.TOPOLOGY_CENTER_X, self.TOPOLOGY_CENTER_Y, 12);
  stage.addChild(router);
};

Animator.prototype._getTrafficRotation = function(originX, destX, originY, destY) {
  var self = getAnimatorSelfInstance(this);
  var rotation = self._slopeToDegrees(
    self._findSlope(originX, destX, originY, destY)
  );

  if (destX < originX) {
    rotation += 180;
  } else if (destX == originX) {
    if (destY < originY) {
      rotation -= 90;
    } else {
      rotation += 90;
    }
  }

  return rotation;
}
