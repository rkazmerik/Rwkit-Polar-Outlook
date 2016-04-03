(function () {
    "use strict";

    //Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            app.buildNotification();
            
            //detect the current poll from email body
            if(window.location.pathname == '/polls/view') {
                app.redirectToCurrentPoll();
            }
            
            //add new answer input to create view
            $("#AddAnswerInput").click(function (event) {
                event.preventDefault();
                $(".ms-Grid-row:hidden:first .answer").prop("disabled", false);
                $(".ms-Grid-row:hidden:first .total").prop("disabled", false);
                $(".ms-Grid-row:hidden:first .jscolor").prop("disabled", false);
                $(".ms-Grid-row:hidden:first").show();
            });
      
            //remove answer input to create view
            $(".remove-answer").click(function (event) {
                event.preventDefault();
                if ($("#Answers .ms-Grid-row").length > 1) {
                    $(this).parent().parent().find(".answer").prop("disabled", true);
                    $(this).parent().parent().find(".total").prop("disabled", true);
                    $(this).parent().parent().find(".jscolor").prop("disabled", true);
                    $(this).parent().parent().hide();
                }
            });
            
            //submit a response
            $("#PollData").submit(function (event) {
                event.preventDefault();
                $.ajax({   
                    type: 'POST',   
                    url: '/view/b49f4e40-cd13-11e5-8bb6-f598a8be1927',   
                    data: $(this).serialize(),
                    success: function(data){
                        $("#PollResults").html(data);
                        $("#PollResults").fadeIn(500);
                        $("#PollButtons").toggle();
                    }
                }); 
            });

            //insert poll into email body
            $("#InsertPoll").click(function (event) {
                Office.context.mailbox.item.body.setSelectedDataAsync(
                    '<a id="LPNoLP" href="http://www.contoso.com" onClick="alert()">Clicky here!</a>',                    
                    { coercionType: Office.CoercionType.Html });
            });

            //office add-in notification bar
            $('#notification-message-close').click(function () {
                $('#notification-message').hide();
            });

            $(".delete-row").click(function (event) {
                event.preventDefault();
                $.get('/views/helpers/delete.hbs').done(function(src) {
                    app.showNotification("Delete Poll?", src);
                    
                    //delete button for delete notification
                    $("#notification-message .delete").click(function (event) {
                        window.location.replace($('.delete-row').attr('href'));
                    });
                }); 
            });    
        });    
    //};
})();