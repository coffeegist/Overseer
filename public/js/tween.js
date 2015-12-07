var stage = new createjs.Stage("demoCanvas");

function init() {
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
  stage.addChild(circle);

  /*createjs.Tween.get(circle, { loop: true })
    .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4))
    .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getPowInOut(2))
    .to({ alpha: 0, y: 225 }, 100)
    .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getPowInOut(2))
    .to({ x: 100 }, 800, createjs.Ease.getPowInOut(2));
  */
  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);
  shootLaser(50, 250)
}

function shootLaser(x, y) {
  var beam = new createjs.Shape();

  beam.graphics.beginFill("red");
  beam.graphics.moveTo(0,1.5).lineTo(70,0).lineTo(70,3).closePath();
  beam.x = x;
  beam.y = y;
  stage.addChild(beam);

  beam.setBounds(0,0,70,3);
  createjs.Tween.get(beam,{ loop: false, onChange: beamUpdate })
    .to({ x: 940, alpha: 0 }, 1500, createjs.Ease.quadOut(2));
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

function createNode(ip) {
  var circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(50, 250, 25);
  stage.addChild(circle);
}
