(function () {
    "use strict";

    //Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            app.buildNotification();
            
            //add new answer input to create view
            $(".add-answer").click(function (event) {
                event.preventDefault();

                //grab the html for the new controls
                var template = $("#Answers .ms-Grid-row:last").html();
                $("#Answers .ms-Grid-row:last").append(template);
                
                //create a new color picker
                var color = app.getRandomColor(120,250);
                var input = document.createElement('input')
                var picker = new jscolor(input);

                //replace the templates color picker
                $("#Answers .ms-Grid-col:last").html(input);
            });
      
            //remove answer input to create view
            $(".remove-answer").click(function (event) {
                event.preventDefault();
                if ($("#Answers .ms-Grid-row:visible").length > 1) {
                    $(this).parent().parent().find('input').attr("disabled", true);
                    $(this).parent().parent().hide();
                }
            });
            
            //on create load
            $("#CreatePoll").ready(function(){
                $("#Answers .ms-Grid-row").each(function(i){
                    var id = ($(this).find('.answerId:input').val());
                    if(i > 1 && id == null){
                        $(this).hide();
                        $(this).find('input').attr('disabled','disabled');
                    }
                })
            });
            
            //on poll create
            $("#CreatePoll").submit(function (event) {
                $('.required:enabled').each(function(){
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
            $("#PollData").submit(function (event) {
                event.preventDefault();
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
                            $(".submit-response").hide();
                            $(".submit-response").attr("disabled","disabled");
                            $("#PollResults").html(data);
                            $("#PollResults").slideDown('slow');
                            $("#PollButtons").slideDown('slow');
                        }
                    }); 
                }
            });
            
            //reload the view page
            $("#ResubmitPollButton").click(function(event) {
                var pollId = ($("#PollId").val());
                window.location.replace('/view/'+pollId+'?mode=preview');
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