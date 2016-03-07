$(function() {
  $("#error-modal-container").load( "/templates/error-modal.html");
});
;var stage = new createjs.Stage("trafficCanvas");

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

  self._protocolColors = {
    'arp': 'blue',
    'ipv4': 'red',
    'ipv6': 'green'
  };

  self._nodes = {};
  self._networkFilterV4 = ipaddr.parseCIDR("0.0.0.0/0");
  self._showIPv4 = true;
  self._networkFilterV6 = ipaddr.parseCIDR("0::0/0");
  self._showIPv6 = true;
  self._redrawInterval = 0;
  self._canvasZoom = 0;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.addEventListener("tick", stage);

  self._drawRouter();

  if( self._redrawInterval > 0 ) clearInterval(self._redrawInterval);
  self._redrawInterval = setInterval(self._redrawNodes, self.REDRAW_FREQUENCY);
}

Animator.prototype.addNode = function(ip) {
  var self = getAnimatorSelfInstance(this);
  var ipObj = ipaddr.parse(ip);
  var filter = self._networkFilterV4;
  var showNode = ipObj.kind() === 'ipv6' ? self._showIPv6 : self._showIPv4;

  if (ipObj.kind() === 'ipv6') {
    filter = self._networkFilterV6;
  }

  if (!(ip in self._nodes) && ipaddr.parse(ip).match(filter) && showNode) {
    self._nodes[ip] = {
      graphic : self._createNodeGraphic(ip),
      x : 0,
      y : 0
    };
    stage.addChild(self._nodes[ip].graphic);
    self._redrawNodes();
  }
};

Animator.prototype.removeAllNodes = function() {
  var self = getAnimatorSelfInstance(this);

  for (var ip in self._nodes) {
    stage.removeChild(self._nodes[ip].graphic);
    delete self._nodes[ip];
  }
};

Animator.prototype.setNetworkFilterV4 = function(newFilter) {
  var self = getAnimatorSelfInstance(this);

  if (newFilter) {
    self._networkFilterV4 = newFilter;
  } else {
    self._networkFilterV4 = ipaddr.parseCIDR("0.0.0.0/0");
  }

  self._resetNodeView();
};

Animator.prototype.resetNetworkFilterV4 = function() {
  var self = getAnimatorSelfInstance(this);

  self._networkFilterV4 = ipaddr.parseCIDR("0.0.0.0/0");

  self._resetNodeView();
};

Animator.prototype.setIPv4Visibility = function(bool) {
  var self = getAnimatorSelfInstance(this);
  self._showIPv4 = bool;
  self._resetNodeView();
};

Animator.prototype.setNetworkFilterV6 = function(newFilter) {
  var self = getAnimatorSelfInstance(this);

  if (newFilter) {
    self._networkFilterV6 = newFilter;
  } else {
    self._networkFilterV6 = ipaddr.parseCIDR("0::0/0");
  }

  self._resetNodeView();
};

Animator.prototype.resetNetworkFilterV6 = function() {
  var self = getAnimatorSelfInstance(this);

  self._networkFilterV6 = ipaddr.parseCIDR("0::0/0");

  self._resetNodeView();
};

Animator.prototype.setIPv6Visibility = function(bool) {
  var self = getAnimatorSelfInstance(this);
  self._showIPv6 = bool;
  self._resetNodeView();
};

Animator.prototype.addTraffic = function(sourceAddr, destAddr, type) {
  var self = getAnimatorSelfInstance(this);
  var result = false;

  try {
    var cidrRange = self._isMulticast(destAddr);
    if (cidrRange == -1 || (type != 'ipv4' && type != 'ipv6')) {
      self.displayTraffic(sourceAddr, destAddr, type);
    } else {
      for (var ip in self._nodes) {
        console.log(ip, destAddr, cidrRange);
        if (ipaddr.parse(ip).match(ipaddr.parse(destAddr), cidrRange)) {
          self.displayTraffic(sourceAddr, ip, type);
        }
      }
    }

    result = true;
  } catch (e) {
    console.log('Error adding traffic: ', e);
  } finally {
    return result;
  }
};

Animator.prototype.displayTraffic = function(sourceAddr, destAddr, type) {
  var self = getAnimatorSelfInstance(this);
  var originX = 0, originY = 0;
  var destX = 0, destY = 0;
  var result = false;

  try {
    var sourceNode = self._nodes[sourceAddr];
    var destNode = self._nodes[destAddr];

    /* Calculate origin and destination x,y coordinates */
    if (sourceNode && sourceNode.graphic) {
      originX = sourceNode.x;
      originY = sourceNode.y;
    } else {
      originX = self.TOPOLOGY_CENTER_X;
      originY = self.TOPOLOGY_CENTER_Y;
    }

    if (destNode && destNode.graphic) {
      destX = destNode.x;
      destY = destNode.y;
    } else {
      destX = self.TOPOLOGY_CENTER_X;
      destY = self.TOPOLOGY_CENTER_Y;
    }

    /* Draw laser */
    var beam = new createjs.Shape();
    beam.graphics.beginFill(self._protocolColors[type]);
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

    result = true;
  } catch (e) {
    console.log('Error displaying traffic: ', e);
  } finally {
    return result;
  }
};

Animator.prototype._beamUpdate = function(e) {
  /* Stub for future use */
};

Animator.prototype._beamComplete = function(e) {
  var self = getAnimatorSelfInstance(this);
  var beam = e.target;
  stage.removeChild(beam.mask);
  stage.removeChild(beam);
  createjs.Tween.removeTweens(e);
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
  var totalNodes = Object.keys(self._nodes).length;
  var current = 0;
  var step = (Math.PI * 2) / totalNodes;

  for (var ip in self._nodes) {
    var newX = self.TOPOLOGY_CENTER_X + self.TOPOLOGY_RADIUS * Math.cos(current);
    var newY = self.TOPOLOGY_CENTER_Y + self.TOPOLOGY_RADIUS * Math.sin(current);
    createjs.Tween.get(self._nodes[ip].graphic, {loop: false})
      .to({x: newX, y: newY}, 500, createjs.Ease.linear);

    self._nodes[ip].x = newX;
    self._nodes[ip].y = newY;
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

Animator.prototype._resetNodeView = function() {
  socket.emit("nodeListRequest");
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

Animator.prototype._isMulticast = function(address) {
  var ip = ipaddr.parse(address);
  var lastOctetWasBroadcast = false;
  var result = 0;

  try {
    if (ip.kind() == 'ipv6') {
      // TODO, more accurate multicast simulation.
      // http://ipv6friday.org/blog/2011/12/ipv6-multicast/
      result = ip.range() == 'multicast' ? 0 : -1;
    } else {
      var octets = ip.octets;
      for (i=0; i<octets.length; i++) {
        console.log('octet ' + octets[i])
        if (octets[i] == 255) {
          if (!lastOctetWasBroadcast) {
            result = 8 * i;
          }
          lastOctetWasBroadcast = true;
        } else {
          result = -1
          lastOctetWasBroadcast = false;
        }
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    console.log('returning: ' + result + ' for ', address)
    return result;
  }
};
;$(function() {
  socket.on("connect", function() {
    socket.emit("nodeListRequest");
  });

  socket.on("reconnect", function() {
    socket.emit("nodeListRequest");
  });

  socket.on("system", function(data) {
    addMessageToDOM(data.msg);
  });

  socket.on("traffic", function(data) {
    var result = animator.addTraffic(data.addresses[0], data.addresses[1], data.type);
    if (result) {
      addMessageToDOM(data.type + " - " + data.msg);
      if (data.serviceName) {
        NetworkStatistics.addServiceCount(data.serviceName, data.port);
      }
    }
  });

  socket.on("newNode", function(data) {
    animator.addNode(data.ip);
  });

  socket.on("nodeList", function(data) {
    animator.removeAllNodes();

    for(var i = 0; i < data.list.length; i++) {
      animator.addNode(data.list[i]);
    }
  });

  socket.on("error", function(data) {
    showError(data.error);
  });
});

function addMessageToDOM(traffic) {
  var trafficFeed = $('#trafficFeed');
  trafficFeed.prepend("<p class=\"trafficMessage\">" + traffic + "</p>");

  if (trafficFeed[0].childElementCount > 10) {
    trafficFeed.html(trafficFeed.children().slice(0,10));
  }
}
;$(function () {
  var $startButton = $('#startCapture');
  var $stopButton = $('#stopCapture');
  var $ipv4Toggle = $('#ipv4-toggle');
  var $networkFilterV4 = $('#networkFilterV4');
  var $networkFilterClearV4 = $('#networkFilterClearV4');
  var $ipv6Toggle = $('#ipv6-toggle');
  var $networkFilterV6 = $('#networkFilterV6');
  var $networkFilterClearV6 = $('#networkFilterClearV6');

  $startButton.click(function(e) {
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
  });

  $ipv4Toggle.change(function() {
    animator.setIPv4Visibility($(this).prop('checked'));
  });

  $ipv6Toggle.change(function() {
    animator.setIPv6Visibility($(this).prop('checked'));
  });

  $networkFilterClearV4.click(function(e) {
    animator.resetNetworkFilterV4();
    $networkFilterV4.val("");
  });

  $networkFilterClearV6.click(function(e) {
    animator.resetNetworkFilterV6();
    $networkFilterV6.val("");
  });

  $networkFilterV4.keydown(function(event) {
    if (!event) {
      var event = window.event;
    }

    if (event.which == 13) {
      event.preventDefault();
      var networkFilterInput = $networkFilterV4.val();
      var filter = undefined;

      try {
        if (networkFilterInput) {
          filter = ipaddr.IPv4.parseCIDR($networkFilterV4.val());
          animator.setNetworkFilterV4(filter);
        } else {
          animator.resetNetworkFilterV4();
        }
      } catch (e) {
        showError(e);
      } finally {
        $networkFilterV4.blur();
      }
    }
  });

  $networkFilterV6.keydown(function(event) {
    if (!event) {
      var event = window.event;
    }

    if (event.which == 13) {
      event.preventDefault();
      var networkFilterInput = $networkFilterV6.val();
      var filter = undefined;

      try {
        if (networkFilterInput) {
          filter = ipaddr.IPv6.parseCIDR($networkFilterV6.val());
          animator.setNetworkFilterV6(filter);
        } else {
          animator.resetNetworkFilterV6();
        }
      } catch (e) {
        showError(e);
      } finally {
        $networkFilterV6.blur();
      }
    }
  });
});
;var NetworkStatistics = (function() {
  var _serviceTrackingMap = [];

  var updateDOMProtocolInfo = function() {
    _serviceTrackingMap.sort(function(a, b) {
        return b.count - a.count;
    });

    for (var i=Math.min(5,_serviceTrackingMap.length); i-- ;) {
      $('#service' + i).html('<strong>' + _serviceTrackingMap[i].serviceName + '</strong>');
      $('#count' + i).html('<strong>' + _serviceTrackingMap[i].count + '</strong>');
      $('#port' + i).html('<strong>' + _serviceTrackingMap[i].port + '</strong>');
    }
  };

  return {
    addServiceCount : function(serviceName, port) {
      var element = undefined;
      for (var i=_serviceTrackingMap.length; i-- ;) {
        if (_serviceTrackingMap[i].port === port) {
          element = _serviceTrackingMap[i];
          break;
        }
      }

      if (typeof element === 'undefined') {
        _serviceTrackingMap.push({
          serviceName: serviceName,
          count: 1,
          port: port
        });
      } else {
        element.count++;
      }

      updateDOMProtocolInfo();
    }
  };
})();
;var app = app || {};
var socket = io.connect();
var animator = new Animator();

function showError(message) {
  $("#error-message").html(message);
  $(".error-modal").modal();
}
