/**
 * Created by JJW on 2016-11-14.
 */

$(function() {

    //소켓 객체를 이전 창에서 받아온다..
   // var socket = window.opener.socket;
//    var socket = io();
    var chatForm = $("#chatform"),
        footer = $("footer"),
        textarea = $("#message"),
        chats = $(".chats");
        chatScreen = $(".chatscreen");

    var name = "";
/*    var uName = param.req("username");
    console.log("uname : " + uName);*/
/*    var opener = window.opener;
    var socket;
    if(opener) {
        //var oDom = opener.document;
        socket = opener.socket;
        /!*var elem = oDom.getElementById("your element");
        if (elem) {
            var val = elem.value;
        }*!/
    }*/


    console.log("[client-chatScr] socket : " + socket);


    chatForm.on('submit', function (e) {

        e.preventDefault();

        // Create a new chat message and display it directly

        showMessage("chatStarted");

        if (textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, moment());
            scrollToBottom();

            // Send the message to the other person in the chat
            socket.emit('msg', {msg: textarea.val(), user: name});

        }
        // Empty the textarea
        textarea.val("");
    });


    // Update the relative time stamps on the chat messages every minute

    setInterval(function () {

        messageTimeSent.each(function () {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });

    }, 60000);

    // Function that creates a new chat message

    function createChatMessage(msg, user, now) {

        var who = '';

        if (user === name) {
            who = 'me';
        }
        else {
            who = 'you';
        }

        var li = $(
            '<li class=' + who + '>' +
            '<div class="image">' +

            '<b></b>' +
            '<i class="timesent" data-time=' + now + '></i> ' +
            '</div>' +
            '<p></p>' +
            '</li>');

        // use the 'text' method to escape malicious user input
        li.find('p').text(msg);
        li.find('b').text(user);

        chats.append(li);

        messageTimeSent = $(".timesent");
        messageTimeSent.last().text(now.fromNow());
    }

    function scrollToBottom() {
        $("html, body").animate({scrollTop: $(document).height() - $(window).height()}, 1000);
    }

    function showMessage(status,data){

        if(status === "chatStarted"){

          //  section.children().css('display','none');
            chatScreen.css('display','block');

            footer.fadeIn(1200);
        }
    }
})