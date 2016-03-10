$(function() {
  $.ajax({
    url: "/templates/error-modal.html",
    success: function (data) {
      $("#error-modal-container").html(data);
    },
    dataType: 'html'
  });
});
