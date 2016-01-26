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
  self._setupCanvas();
  stage.addEventListener("stagemousedown", self._mouseDownHandler);

  self.NODE_RADIUS = 25;
  self.TOPOLOGY_RADIUS =
    Math.min(self._canvas.width, self._canvas.height)/2 - self.NODE_RADIUS*2;
  self.REDRAW_FREQUENCY = 1000;
  self.TOPOLOGY_CENTER_X = self._canvas.width/2;
  self.TOPOLOGY_CENTER_Y = self._canvas.height/2;
  self.TOPOLOGY_WIDTH = self._canvas.width;
  self.TOPOLOGY_HEIGHT = self._canvas.height;

  self._nodesClassC = [];
  self._nodesExternal = [];
  self._redrawInterval = 0;
  self._canvasZoom = 0;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  self._drawRouter();

  if( self._redrawInterval > 0 ) clearInterval(self._redrawInterval);
  self._redrawInterval = setInterval(self._redrawNodes, self.REDRAW_FREQUENCY);
}

Animator.prototype.addNode = function(node) {
  var self = getAnimatorSelfInstance(this);

  if (node.isAddressClassC() && !(self._isNodeTracked(node))) {
    node.graphic = self._createNodeGraphic(node.getIP());
    stage.addChild(node.graphic);
    self._nodesClassC.push(node)
    self._redrawNodes();
  } else {
    self._nodesExternal.push(node);
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
    self.addNode(node);
  } else if (arg.traffic != undefined) {
    var traffic = arg.traffic;
    self.displayTraffic(traffic.getSourceIP(), traffic.getDestinationIP(), traffic.getColor());
  }
};

Animator.prototype.displayTraffic = function(sourceAddr, destAddr, color) {
  var self = getAnimatorSelfInstance(this);
  var originX = 0, originY = 0;
  var destX = 0, destY = 0;

  var sourceNode = self._getNodeByIP(sourceAddr);
  var destNode = self._getNodeByIP(destAddr);

  /* Calculate origin and destination x,y coordinates */
  if (sourceNode) {
    originX = sourceNode.x;
    originY = sourceNode.y;
  } else {
    originX = self.TOPOLOGY_WIDTH / 2;
    originY = self.TOPOLOGY_HEIGHT / 2;
  }

  if (destNode) {
    destX = destNode.x;
    destY = destNode.y;
  } else {
    destX = self.TOPOLOGY_WIDTH / 2;
    destY = self.TOPOLOGY_HEIGHT / 2;;
  }

  /* Draw laser */
  var beam = new createjs.Shape();
  beam.graphics.beginFill(color);
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
  stage.removeChild(beam.mask);
  stage.removeChild(beam);
};

Animator.prototype._createNodeGraphic = function(ip) {
  var self = getAnimatorSelfInstance(this);
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, self.NODE_RADIUS);

  var text = new createjs.Text(ip, "10px Times New Roman", "#000");
  text.x = 0;
  text.y = self.NODE_RADIUS + 5; // radius of circle plus 5px white space
  text.textAlign = "center";

  var container = new createjs.Container();
  container.addChild(circle);
  container.addChild(text);

  return container;
};

Animator.prototype._isNodeTracked = function(node) {
  var self = getAnimatorSelfInstance(this);
  var result = false;
  var nodeList = undefined;

  if (node.isAddressClassC()) {
    nodeList = self._nodesClassC;
  } else {
    nodeList = self._nodesExternal;
  }

  for (var i=0; i<nodeList.length; i++) {
    if (nodeList[i].getIP() == node.getIP()) {
      result = true;
    }
  }

  return result;
};

Animator.prototype._getNodeByIP = function(ip) {
  var self = getAnimatorSelfInstance(this);
  var result = undefined;

  for (var i=0; i<self._nodesClassC.length; i++) {
    if (self._nodesClassC[i].getIP() == ip) {
      result = self._nodesClassC[i];
      break;
    }
  }

  return result;
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

Animator.prototype._redrawNodes = function() {
  var self = getAnimatorSelfInstance(this);
  var totalNodes = self._nodesClassC.length;
  var current = 0;
  var step = (Math.PI * 2) / totalNodes;

  for (var i=0; i<totalNodes; i++) {
    var newX = self.TOPOLOGY_CENTER_X + self.TOPOLOGY_RADIUS * Math.cos(current);
    var newY = self.TOPOLOGY_CENTER_Y + self.TOPOLOGY_RADIUS * Math.sin(current);
    createjs.Tween.get(self._nodesClassC[i].graphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    self._nodesClassC[i].x = newX;
    self._nodesClassC[i].y = newY;
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
};

Animator.prototype._setupCanvas = function() {
  var self = getAnimatorSelfInstance(this);

  self._canvas = document.getElementById("trafficCanvas");

  var navbarDimensions =
    document.getElementsByClassName("navbar")[0].getBoundingClientRect();
  var footerDimensions =
    document.getElementsByTagName("footer")[0].getBoundingClientRect();

  self._canvas.width = document.body.clientWidth;
  self._canvas.height = document.body.clientHeight
                        - footerDimensions.height
                        - navbarDimensions.height;

  self._canvas.addEventListener("mousewheel", self._mouseWheelHandler, false);
  self._canvas.addEventListener("DOMMouseScroll", self._mouseWheelHandler, false);
};

Animator.prototype._mouseWheelHandler = function(e) {
  var self = getAnimatorSelfInstance(this);

  if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0)
    self._zoom=1.1;
  else
    self._zoom=1/1.1;
        var local = stage.globalToLocal(stage.mouseX, stage.mouseY);
    stage.regX=local.x;
    stage.regY=local.y;
  stage.x=stage.mouseX;
  stage.y=stage.mouseY;
  stage.scaleX=stage.scaleY*=self._zoom;

  stage.update();
};

Animator.prototype._mouseDownHandler = function(e) {
  var offset={x:stage.x-e.stageX,y:stage.y-e.stageY};
  stage.addEventListener("stagemousemove",function(ev) {
    stage.x = ev.stageX+offset.x;
    stage.y = ev.stageY+offset.y;
    stage.update();
  });
  stage.addEventListener("stagemouseup", function(){
    stage.removeAllEventListeners("stagemousemove");
  });
};
