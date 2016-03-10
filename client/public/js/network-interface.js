var currentInterface = new Interface();

function Interface() {
  var self = this;

  self._name = "";
  self._ipList = [];
};

Interface.prototype.getName = function() {
  return this._name;
};

Interface.prototype.setName = function(name) {
  this._name = name;
};

Interface.prototype.getAddressData = function() {
  return this._ipList;
};

Interface.prototype.addAddressData = function(ip, netmask) {
  this._ipList.push([ip, netmask]);
};

Interface.prototype.clearAddressData = function() {
  this._ipList = [];
};

$(function() {
  var $applyInterfaceSettingsButton = $('#apply-interface-settings');

  socket.emit('getInterfaceSettings');
  socket.emit('interfaceListRequest');

  socket.on('monitorModeChanged', function(data) {
    if (data.enabled == false) {
      showError('An error occurred enabling monitor mode for this device.');
      $('#monitor-toggle').prop('checked', false);
    }
  });

  socket.on("interfaceSettings", function(data) {
    currentInterface.setName(data.name);
    currentInterface.clearAddressData();

    for (var i=0; i<data.address.length; i++) {
      currentInterface.addAddressData(data.address[i][0], data.address[i][1]);
    }

    updateCurrentInterface(currentInterface.getName());
  });

  socket.on('interfaceList', function(data) {
    var element = $('#interface-radio-group');
    var html = '';

    html += '<div class="row">';
    for(var i = 0; i < data.list.length; i++) {
      var checked = (data.list[i].selected == true) ? 'checked' : '';

      html += '\
        <div class="col-xs-4">\
          <label class="radio-inline">\
            <input type="radio" name="interface-radio" \
              value="' + data.list[i].name + '" ' + checked + '>' +
                data.list[i].name +
            '</input>\
          </label>\
        </div>';

      // Every third item, starting from 0 to n
      if (i % 3 == 2) {
        html += '</div>';
        html += '<div class="row">';
      }
    }

    html += '</div>';

    element.html(html);
  });

  function updateCurrentInterface(interfaceName) {
    $('.current-interface').each(function() {
      $(this).html(interfaceName);
      console.log(this);
    });
  };

  $('#monitor-toggle').change(function(e) {
      socket.emit("enableMonitorMode", {
        enable: $('#monitor-toggle').prop('checked')
      });
  });

  $applyInterfaceSettingsButton.click(function(e) {
    socket.emit('updateCurrentInterface', {
      name: $("input:radio[name='interface-radio']:checked").val()
    });

    if ($('#monitor-toggle').prop('checked')) {
      socket.emit("enableMonitorMode")
    }
    $('#network-interface-modal').modal('hide');
  });
  /**
   * Vertically center Bootstrap 3 modals so they aren't always stuck at the top
   */
  function reposition() {
    var modal = $(this);
    var dialog = modal.find('.modal-dialog');
    modal.css('display', 'block');

    // Dividing by two centers the modal exactly, but dividing by three
    // or four works better for larger screens.
    dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
  }

  // Reposition when a modal is shown
  $('.modal').on('show.bs.modal', reposition);

  // Reposition when the window is resized
  $(window).on('resize', function() {
      $('.modal:visible').each(reposition);
  });
});
