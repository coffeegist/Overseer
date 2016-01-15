var TW_TOPOLOGY_RADIUS = 200;
var TW_TOPOLOGY_CENTER_X = 440;
var TW_TOPOLOGY_CENTER_Y = 20;
var TW_REDRAW_FREQUENCY = 1000;

var stage = new createjs.Stage("demoCanvas");
var tw_nodes = new Array();
var tw_redraw_interval = 0;

function init() {
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  if( tw_redraw_interval > 0 ) clearInterval(tw_redraw_interval);
  tw_redraw_interval = setInterval(twRedrawNodes, TW_REDRAW_FREQUENCY);
}

function shootLaser(originX, originY, destX, destY) {
  var beam = new createjs.Shape();

  beam.graphics.beginFill("red");
  beam.graphics.moveTo(0,1.5).lineTo(70,0).lineTo(70,3).closePath();
  beam.x = originX;
  beam.y = originY;
  beam.setBounds(0,0,70,3);
  beam.rotation = slopeToDegrees(findSlope(originX, destX, originY, destY));

  stage.addChildAt(beam, 0);

  createjs.Tween.get(beam, {loop: false, onChange: beamUpdate})
    .to({x: destX, y: destY, alpha: 0.25}, 1500, createjs.Ease.linear)
    .call(beamComplete);
}

function beamUpdate(e) {
  var beam = e.currentTarget.target;
  var targetX = e.currentTarget._curQueueProps.x;

  // Make the beam grow smaller when target reached
  // * Needs updated
  /*if( targetX - beam.x < beam.getBounds().width ) {
    //beam.scaleX = (targetX - beam.x) / targetX;
  } else {
    //beam.scaleX = 1;
  }*/
}

function beamComplete(e) {
  var beam = e.target;
  stage.removeChild(beam);
}

function findSlope(x1, x2, y1, y2) {
  if (x1 == x2) {
    return 0;
  } else {
    return (y2 - y1) / (x2 - x1);
  }
}

function slopeToDegrees(slope) {
  // slope to angle to degrees
  return Math.atan(slope) * (180/Math.PI);
}

function twAddNode(ip) {
  if (!(ip in tw_nodes)) {
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
    stage.addChild(circle);
    tw_nodes[ip] = circle;
    twRedrawNodes();
  }
}

function twRedrawNodes() {
  var totalNodes = Object.keys(tw_nodes).length;
  var current = 0;
  var step = (Math.PI * 2) / totalNodes;

  for ( var node in tw_nodes ) {
    nodeGraphic = tw_nodes[node];
    var newX = TW_TOPOLOGY_CENTER_X + TW_TOPOLOGY_RADIUS * Math.sin(current);
    var newY = TW_TOPOLOGY_CENTER_Y + TW_TOPOLOGY_RADIUS * Math.cos(current);
    createjs.Tween.get(nodeGraphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    current += step;
  }
}
