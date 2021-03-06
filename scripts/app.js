        
    var app = (function () {
    "use strict";
    
    var app = {};
    app.initialize = function () {
    
        //detect the current poll from email body
        if(window.location.pathname == '/polls/view') {
            app.redirectToCurrentPoll();
        }
        
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
        
        $('#notification-message-close').click(function () {
            $('#notification-message').hide();
        });
        
        app.getParameterByName = function (name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        app.getRandomColor = function(iDarkLuma, iLightLuma){
  
            for (var i=0;i<20;i++)
            {
                var sColour = ('ffffff' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6);

                var rgb = parseInt(sColour, 16);   // convert rrggbb to decimal
                var r = (rgb >> 16) & 0xff;  // extract red
                var g = (rgb >>  8) & 0xff;  // extract green
                var b = (rgb >>  0) & 0xff;  // extract blue

                var iLuma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

                if (iLuma > iDarkLuma && iLuma < iLightLuma) return sColour;
            }
            return sColour;
        }
    };
    
    return app;
})();
