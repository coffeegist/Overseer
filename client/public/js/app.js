var app = app || {};
var socket = io.connect();
var animator = new Animator();

function showError(message) {
  $("#error-message").html(message);
  $(".error-modal").modal();
}
