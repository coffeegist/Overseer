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

  self.TOPOLOGY_RADIUS = 400;
  self.REDRAW_FREQUENCY = 1000;
  self.TOPOLOGY_CENTER_X = self._canvas.width/2;
  self.TOPOLOGY_CENTER_Y = self._canvas.height/2;
  self.TOPOLOGY_WIDTH = self._canvas.width;
  self.TOPOLOGY_HEIGHT = self._canvas.height;

  self._nodesClassC = new Array();
  self._nodesExternal = new Array();
  self._clusterManager = new ClusterManager();
  self._redrawInterval = 0;
  self._canvasZoom = 0;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  if( self._redrawInterval > 0 ) clearInterval(self._redrawInterval);
  self._redrawInterval = setInterval(self._redrawAllClusters, self.REDRAW_FREQUENCY);
}

Animator.prototype.addNode = function(node) {
  var self = getAnimatorSelfInstance(this);

  node.graphic = self._createNodeGraphic(node.getIP());
  node.x = 0;
  node.y = 0;

  if (self._clusterManager.addNode(node, self._isClassC(node.getIP()), stage)) {
    self._redrawAllClusters();
  } else {
    console.log('failed to add node ', node);
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
    self.displayTraffic(traffic.getSourceIP(), traffic.getDestinationIP());
  }
};

Animator.prototype.displayTraffic = function(sourceAddr, destAddr) {
  var self = getAnimatorSelfInstance(this);
  var originX = 0, originY = 0;
  var destX = 0, destY = 0;

  var sourceNode = self._clusterManager.getNodeByIP(sourceAddr);
  var destNode = self._clusterManager.getNodeByIP(destAddr);

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

Animator.prototype._redrawAllClusters = function() {
  var self = getAnimatorSelfInstance(this);

  var totalClusters = self._clusterManager.getNumberOfClusters();
  var current = 0;
  var step = (Math.PI * 2) / (totalClusters - 1); // -1 account for Center Cluster

  self._redrawCluster(
    self._clusterManager.getCluster(0),
    self.TOPOLOGY_CENTER_X,
    self.TOPOLOGY_CENTER_Y
  );

  for ( var i=1; i < totalClusters; i++ ) {
    var newX = self.TOPOLOGY_CENTER_X + self.TOPOLOGY_RADIUS * Math.cos(current);
    var newY = self.TOPOLOGY_CENTER_Y + self.TOPOLOGY_RADIUS * Math.sin(current);

    self._redrawCluster(self._clusterManager.getCluster(i), newX, newY);
    current += step;
  }
};

Animator.prototype._redrawCluster = function(cluster, centerX, centerY) {
  var self = getAnimatorSelfInstance(this);
  var totalNodes = cluster.getNumberOfNodes();
  var current = 0;
  var step = (Math.PI * 2) / totalNodes;

  for ( var i=0; i < totalNodes; i++ ) {
    var node = cluster.getNode(i);
    nodeGraphic = node.graphic;
    var newX = centerX + (self.TOPOLOGY_RADIUS/4) * Math.cos(current);
    var newY = centerY + (self.TOPOLOGY_RADIUS/4) * Math.sin(current);
    createjs.Tween.get(nodeGraphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    node.x = newX;
    node.y = newY;
    current += step;
  }
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
  var trafficCanvasDimensions =
    document.getElementById("trafficCanvasContainer").getBoundingClientRect();

  self._canvas.width = trafficCanvasDimensions.width;
  self._canvas.height = trafficCanvasDimensions.height;

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
