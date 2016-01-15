var stage = new createjs.Stage("demoCanvas");

function init() {
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
  stage.addChild(circle);

  var circle2 = new createjs.Shape();
  circle2.graphics.beginFill("DeepSkyBlue").drawCircle(890, 250, 25);
  stage.addChild(circle2);

  /*createjs.Tween.get(circle, { loop: true })
    .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
    .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
    .to({ alpha: 0, y: 225 }, 100)
    .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
    .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
  */
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);
  shootLaser(50, 100, 800, 250);
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

  createjs.Tween.get(beam,{ loop: false, onChange: beamUpdate })
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

function createNode(ip) {
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
  stage.addChild(circle);
}
