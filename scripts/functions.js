(function () {
  "use strict";

    //Office.initialize = function (reason) {

    $(document).ready(function () {
      app.initialize();
      
      // Create notification space
      $('body').append(
			'<div id="notification-message">' +
				'<div class="padding">' +
					'<div id="notification-message-close"></div>' +
					'<div id="notification-message-header"></div>' +
					'<div id="notification-message-body"></div>' +
				'</div>' +
			'</div>');

        $('#notification-message-close').click(function () {
            $('#notification-message').hide();
        });
        
        // After initialization, expose a common notification function
        app.showNotification = function (header, text) {
            $('#notification-message-header').text(header);
            $('#notification-message-body').text(text);
            $('#notification-message').slideDown('fast');
        };
        
        console.log("Ready to go!");
        app.showNotification("Ready to go!");

        // After initialization, expose a common notification function
        app.showNotification = function (header, text) {
            $('#notification-message-header').text(header);
            $('#notification-message-body').text(text);
            $('#notification-message').slideDown('fast');
        };
      
      // Detect clicks on selectable list items.
      $(".ms-Table-rowCheck").click(function(event) {
        $(this).parents('.ms-Table-row').toggleClass('is-selected');
      });
      
      // Format friendly dates
      $(".date-field").each(function(index, val){
          var d = new Date(val.innerHTML).toString();
          var date = d.substr(0, d.indexOf(":")-3);
          val.innerHTML = date;
      });
      
      //confirm dialog for delete
      $(".delete-row").click(function(event) {
        event.preventDefault();
        var path = $(this).attr("href");
        $("#DeleteConfirm").attr("data-path", path);
        $("#DeleteDialog").show();
      });
      
      //confirm button for delete dialog
      $("#DeleteConfirm").click(function(event) {
          var path = $("#DeleteConfirm").attr("data-path");
          window.location.replace(path);
          $("#DeleteDialog").hide();
      });
      
      //cancel button for delete dialog
      $("#DeleteCancel").click(function(event) {
        $("#DeleteDialog").hide();
      });
      
      //add new answer input to create view
      $("#AddAnswerInput").click(function(event) {
        event.preventDefault();
        $(".ms-Grid-row:hidden:first .answer").prop("disabled", false);
        $(".ms-Grid-row:hidden:first .total").prop("disabled", false);
        $(".ms-Grid-row:hidden:first .jscolor").prop("disabled", false);
        $(".ms-Grid-row:hidden:first").show();
      });
      
      //remove answer input to create view
      $(".remove-answer").click(function(event) {
        event.preventDefault();
        if($("#Answers .ms-Grid-row").length > 1) {
          $(this).parent().parent().find(".answer").prop("disabled", true);
          $(this).parent().parent().find(".total").prop("disabled", true);
          $(this).parent().parent().find(".jscolor").prop("disabled", true);
          $(this).parent().parent().hide();
        }
      });
      
      //add new question input to create view
      $("#AddQuestionInput").click(function(event) {
        event.preventDefault();
        if($("#Questions .question").length < 10) {
            $("#Questions").append("<div class='question'></div>");
            $("#Questions .question:last").append($("#Questions .question div:first").html());
        }
      });
      
      //insert poll into email body
      $("#InsertPoll").click(function(event) {
          console.log("Hello world");
        Office.context.mailbox.item.body.setSelectedDataAsync(
            '<a id="LPNoLP" href="http://www.contoso.com">Click here!</a>', 
            {coercionType: Office.CoercionType.Html});
      });
      
    });
  //};
  
})();