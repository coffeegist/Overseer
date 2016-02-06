$(function () {
  var $startButton = $('#startCapture');
  var $stopButton = $('#stopCapture');
  var $networkFilterV4 = $('#networkFilterV4');
  var $networkFilterClearV4 = $('#networkFilterClearV4');
  var $networkFilterV6 = $('#networkFilterV6');
  var $networkFilterClearV6 = $('#networkFilterClearV6');

  $startButton.click(function(e) {
    socket.emit("startCapture");
  });

  $stopButton.click(function(e) {
    socket.emit("stopCapture");
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
