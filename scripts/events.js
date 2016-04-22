(function () {
    "use strict";

    //Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            app.buildNotification();
            
            //add new answer input to create view
            $(".add-answer").click(function (event) {
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
            
            //on poll create
            $("#CreatePoll").submit(function (event) {
                $('.required').each(function(){
                    if($(this).val() == ""){
                        event.preventDefault();
                        $(".ms-validation").html("This field is required");
                        $(".ms-validation-answer").html("At least two answers are required");
                    }                
                })  
            });
            
            //on back button click
            $("#BackButtonEdit").click(function(event) {
                var pollId = ($("#PollId").val());
                window.location.replace('/edit/'+pollId);
            });
            
            //on poll preview load
            $("#PollData").ready(function(){
                if(app.getParameterByName('mode') == 'preview') {
                    $.get('../views/helpers/preview.hbs', function(html){
                        app.showNotification('',html);
                        
                        if($("#PollResults").is(":visible")){
                            $("#PreviewChart").slideToggle('slow');
                        } else {
                            $("#PreviewPoll").slideToggle('slow');
                        }
                    });
                }
            });
            
            //on poll submit
            $("#PollData").unbind().submit(function (event) {
                event.preventDefault();
                console.log("Submitting");
                
                var pollId = ($("#PollId").val());
                if (!$("input[name='answers']:checked").val()) {
                    $(".ms-validation").html("*At least one response in required");
                }
                else {
                    $.ajax({   
                        type: 'POST',   
                        url: '/view/'+pollId,   
                        data: $(this).serialize(),
                        success: function(data){
                            $(".ms-validation").hide();
                            $("#PollResults").html(data);
                            $("#PollResults").slideDown('slow');
                            $("#PollButtons").slideDown('slow');
                        }
                    }); 
                }
            });

            //insert poll into email body
            $("#InsertPollButton").unbind().click(function (event) {
                event.preventDefault();
                var pollId = $("#PollId").val();
                //reset the poll
                $.get('/reset/'+pollId, function(){
                    //insert the poll into the email
                    //Office.context.mailbox.item.body.setSelectedDataAsync(
                    //    '<a id="LPNoLP" href="http://www.contoso.com" onClick="alert()">Clicky here!</a>',                    
                    //    { coercionType: Office.CoercionType.Html });
                    //});
                });
            });
            
    
        });    
    //};
})();