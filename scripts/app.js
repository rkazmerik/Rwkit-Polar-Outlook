var app = (function () {
    "use strict";

    var app = {};
    app.initialize = function () {
        
        //add-in notification bar
        app.buildNotification = function () {
             $('body').append(
                '<div id="notification-message">' +
                '<div class="padding">' +
                '<div id="notification-message-close"></div>' +
                '<div id="notification-message-header"></div>' +
                '<div id="notification-message-body"></div>' +
                '</div>' +
             '</div>');
        };

        app.showNotification = function (header, text) {
            $('#notification-message-header').text(header);
            $('#notification-message-body').html(text);
            $('#notification-message').slideDown('fast');
        };
        
        app.redirectToCurrentPoll = function () {          
            //get the email message body
            Office.context.mailbox.item.body.getAsync("html",
                function callback(result) {
                    var pollId = app.getPollIdFromEmail(result); 
                    window.location.replace('/polls/view/'+pollId+'?mode=preview');
                });
        };
        
        app.getPollIdFromEmail = function(data) {        
            //get the pollId from the email body
            var body = data.value.toString();
            var start = body.indexOf('/polls/view/');
            var pollId = body.substring(start + 12, start + 48);
            
            return pollId;
        }
    };
    return app;
})();