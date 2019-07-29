/**
 * Created by JJW on 2016-11-07.
 */
$(document).on('click', '.panel-heading span.icon_minim', function (e) {
    var $this = $(this);
    if (!$this.hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideUp();
        $this.addClass('panel-collapsed');
        $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
    } else {
        $this.parents('.panel').find('.panel-body').slideDown();
        $this.removeClass('panel-collapsed');
        $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('focus', '.panel-footer input.chat_input', function (e) {
    var $this = $(this);
    if ($('#minim_chat_window').hasClass('panel-collapsed')) {
        $this.parents('.panel').find('.panel-body').slideDown();
        $('#minim_chat_window').removeClass('panel-collapsed');
        $('#minim_chat_window').removeClass('glyphicon-plus').addClass('glyphicon-minus');
    }
});
$(document).on('click', '#new_chat', function (e) {
    var size = $( ".chat-window:last-child" ).css("margin-left");
    size_total = parseInt(size) + 400;
    alert(size_total);
    var clone = $( "#chat_window_1" ).clone().appendTo( ".container" );
    clone.css("margin-left", size_total);
});
$(document).on('click', '.icon_close', function (e) {
    //$(this).parent().parent().parent().parent().remove();
    $( "#chat_window_1" ).remove();
});


// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

    // getting the id of the room from the url
    var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

    console.log("Id : " + id);
    // connect to the socket
    var socket = io();

    // variables which hold the data for each person
    var name = "",
        email = "",
        img = "",
        friend = "";

    // cache some jQuery objects
    var section = $(".section"),
        footer = $("footer"),
        onConnect = $(".connected"),
        inviteSomebody = $(".invite-textfield"),
        personInside = $(".personinside"),
        chatScreen = $(".chatscreen"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        tooManyPeople = $(".toomanypeople");

    // some more jquery objects
    var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        loginForm = $(".loginForm"),
        yourName = $("#yourName"),
        yourEmail = $("#yourEmail"),
        hisName = $("#hisName"),
        hisEmail = $("#hisEmail"),
        chatForm = $("#chatform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".panel-body");

    // these variables hold images
    var ownerImage = $("#ownerImage"),
        leftImage = $("#leftImage"),
        noMessagesImage = $("#noMessagesImage");


    // on connection to server get the id of person's room
    socket.on('connect', function(){

        console.log("client id : " + id);
        socket.emit('load', id);
    });

    // save the gravatar url
    socket.on('img', function(data){
        img = data;
    });

    // receive the names and avatars of all people in the chat room
    socket.on('peopleinchat', function(data){

        //채팅에 있는 사람 수 체크..
        if(data.number === 0){

           /* showMessage("connected");

            //이벤트 등록
            loginForm.on('submit', function(e){

                e.preventDefault();

                name = $.trim(yourName.val());

                if(name.length < 1){
                    alert("Please enter a nick name longer than 1 character!");
                    return;
                }

                email = yourEmail.val();

                if(!isValid(email)) {
                    alert("Please enter a valid email!");
                }
                else {

                    showMessage("inviteSomebody");

                    // call the server-side function 'login' and send user's parameters
                    socket.emit('login', {user: name, avatar: email, id: id});
                }

            });*/

           name = "test";
           email = "test@gmail.com";

            socket.emit('login', {user: name, avatar: email, id: id});
        }

        else if(data.number === 1) {

            showMessage("personinchat",data);

            loginForm.on('submit', function(e){

                e.preventDefault();

                name = $.trim(hisName.val());

                if(name.length < 1){
                    alert("Please enter a nick name longer than 1 character!");
                    return;
                }

                if(name == data.user){
                    alert("There already is a \"" + name + "\" in this room!");
                    return;
                }
                email = hisEmail.val();

                if(!isValid(email)){
                    alert("Wrong e-mail format!");
                }
                else {
                    socket.emit('login', {user: name, avatar: email, id: id});
                }

            });
        }

        else {
            showMessage("tooManyPeople");
        }

    });

    // Other useful

    socket.on('startChat', function(data){
        console.log("[Client] on startChat - data username : " + data.users);
        if(data.boolean && data.id == id) {

            chats.empty();

            if(name === data.users[0]) {

                showMessage("youStartedChatWithNoMessages",data);
            }
            else {

                showMessage("heStartedChatWithNoMessages",data);
            }

            chatNickname.text(friend);
        }
    });

    socket.on('leave',function(data){

        if(data.boolean && id==data.room){

            showMessage("somebodyLeft", data);
            chats.empty();
        }

    });

    socket.on('tooMany', function(data){

        if(data.boolean && name.length === 0) {

            showMessage('tooManyPeople');
        }
    });

    socket.on('receive', function(data){

        //showMessage('chatStarted');
        console.log("[client] on receive - data.msg : " + data.msg);
        if(data.msg.trim().length) {
            createChatMessage(data.msg, data.user, data.img, moment());
            scrollToBottom();
        }
    });

    textarea.keypress(function(e){

        // Submit the form on enter

        if(e.which == 13) {
            e.preventDefault();
            chatForm.trigger('submit');
        }

    });

    chatForm.on('submit', function(e){

        console.log("[client] on submit");
        e.preventDefault();

        // Create a new chat message and display it directly

       // showMessage("chatStarted");

        if(textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, img, moment());
            scrollToBottom();

            // Send the message to the other person in the chat
            console.log("[client] text val : " + textarea.val());
            socket.emit('msg', {msg: textarea.val(), user: name, img: img});

        }
        // Empty the textarea
        textarea.val("");
    });

    // Update the relative time stamps on the chat messages every minute

    setInterval(function(){

        messageTimeSent.each(function(){
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });

    },60000);

    // Function that creates a new chat message

    function createChatMessage(msg,user,imgg,now){

        var who = '';

        if(user===name) {
            who = 'me';
        }
        else {
            who = 'you';
        }

/*        var li = $(
            '<li class=' + who + '>'+
            '<div class="image">' +
            '<img src=' + imgg + ' />' +
            '<b></b>' +
            '<i class="timesent" data-time=' + now + '></i> ' +
            '</div>' +
            '<p></p>' +
            '</li>');*/

        //data 형태  생성
        var li = $(
            '<div class="row msg_container base_sent">'+
            '<div class="col-md-10 col-xs-10">' +
            '<div class="messages msg_sent">' +
            '<p></p>' +
            '<b></b>' +
            '</div>' +
            '</div>' +
            '</div>');

        // use the 'text' method to escape malicious user input
        li.find('p').text(msg);
        li.find('b').text(user);

        chats.append(li);

        messageTimeSent = $(".timesent");
        messageTimeSent.last().text(now.fromNow());
    }

    function scrollToBottom(){
        $("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
    }

    function isValid(thatemail) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(thatemail);
    }

    function showMessage(status,data){

        if(status === "connected"){

            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
        }

        else if(status === "inviteSomebody"){

            // Set the invite link content
            $("#link").text(window.location.href);

            onConnect.fadeOut(1200, function(){
                inviteSomebody.fadeIn(1200);
            });
        }

        else if(status === "personinchat"){

            onConnect.css("display", "none");
            personInside.fadeIn(1200);

            chatNickname.text(data.user);
            ownerImage.attr("src",data.avatar);
        }

        else if(status === "youStartedChatWithNoMessages") {

            left.fadeOut(1200, function() {
                inviteSomebody.fadeOut(1200,function(){
                    noMessages.fadeIn(1200);
                    footer.fadeIn(1200);
                });
            });

            friend = data.users[1];
            noMessagesImage.attr("src",data.avatars[1]);
        }

        else if(status === "heStartedChatWithNoMessages") {

            personInside.fadeOut(1200,function(){
                noMessages.fadeIn(1200);
                footer.fadeIn(1200);
            });

            friend = data.users[0];
            noMessagesImage.attr("src",data.avatars[0]);
        }

        else if(status === "chatStarted"){

            section.children().css('display','none');
            chatScreen.css('display','block');
        }

        else if(status === "somebodyLeft"){

            leftImage.attr("src",data.avatar);
            leftNickname.text(data.user);

            section.children().css('display','none');
            footer.css('display', 'none');
            left.fadeIn(1200);
        }

        else if(status === "tooManyPeople") {

            section.children().css('display', 'none');
            tooManyPeople.fadeIn(1200);
        }
    }

});
