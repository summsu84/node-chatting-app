/**
 * Created by JJW on 2016-11-10.
 */
// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

    // getting the id of the room from the url
//    var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

    //console.log("Id : " + id);
    // connect to the socket
    var socket = io();

    // variables which hold the data for each person
    var name = "",
        address = "",
        interestedpart = "";


    // cache some jQuery objects
    var section = $(".section"),
        footer = $("footer"),
        onConnect = $(".connected"),
        inviteSomebody = $(".invite-textfield"),
        personInserver = $(".personinserver"),
        personInside = $(".personinside"),
        userList = $(".userList"),
        userTablList = $("#tblUserList"),
        chatScreen = $(".chatscreen"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        tooManyPeople = $(".toomanypeople");

    // some more jquery objects
    var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        loginForm = $(".loginForm"),
        yourName = $("#yourName"),
        yourAddress = $("#yourAddress"),
        yourInterestedPart = $("#yourInterestedPart"),
        yourEmail = $("#yourEmail"),
        hisName = $("#hisName"),
        hisEmail = $("#hisEmail"),
        chatForm = $("#chatform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".chats");

    // these variables hold images
    var ownerImage = $("#ownerImage"),
        leftImage = $("#leftImage"),
        noMessagesImage = $("#noMessagesImage");


    // on connection to server get the id of person's room
    socket.on('connect', function(){

        //서버에 연결이 성공적일때, load  시그널을 보낸다.
        socket.emit('load', "test");

    });

    // save the gravatar url
    socket.on('img', function(data){
        img = data;
    });

    // receive the names and avatars of all people in the chat room
    socket.on('peopleinchat', function(data) {

        console.log("[Client] on peopleinchat - data.number : " + data.number);
        //채팅에 있는 사람 수 체크..

        //로그인 폼에 이벤트 등록한다..
        showMessage("connected");
        loginForm.on('submit', function (e) {

            e.preventDefault();

            name = $.trim(yourName.val());
            address = $.trim(yourAddress.val());
            interestedpart = $.trim(yourInterestedPart.val());
            console.log("name : " + name + " , addr : " + address);

            if (name.length < 1) {
                alert("Please enter a nick name longer than 1 character!");
                return;
            }
            //showMessage("inviteSomebody");

            // call the server-side function 'login' and send user's parameters
            socket.emit('login', {user: name, address: address, interestedpart: interestedpart});
        });
    });

    //현재 서버에 접속한 사람 수 보여주기..
    socket.on('peopleinserver', function(data){

        console.log("[client] receive : " + data.connectedClient);

        showMessage("personinserver",data.connectedClient);

    });


    socket.on('startChat', function(data){
        console.log(data);
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

        showMessage('chatStarted');

        if(data.msg.trim().length) {
            createChatMessage(data.msg, data.user, moment());
            scrollToBottom();
        }
    });

    //서버로 부터 메시지를 수신 초대
    socket.on('chatfrom', function(data){

        console.log("chatfrom : " + data.chatfrom);

        showMessage("chatfrom", data.chatfrom);
    });

    //상대방으로 부터 오케이 수신
    socket.on('chatok', function (data) {

        console.log("chatok roomId : " + data.roomId)

        showMessage("chatStarted");
    });



    textarea.keypress(function(e){

        // Submit the form on enter

        if(e.which == 13) {
            e.preventDefault();
            chatForm.trigger('submit');
        }

    });

    chatForm.on('submit', function(e){

        e.preventDefault();

        // Create a new chat message and display it directly

        showMessage("chatStarted");

        if(textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, moment());
            scrollToBottom();

            // Send the message to the other person in the chat
            socket.emit('msg', {msg: textarea.val(), user: name});

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

    function createChatMessage(msg,user,now){

        var who = '';

        if(user===name) {
            who = 'me';
        }
        else {
            who = 'you';
        }

        var li = $(
            '<li class=' + who + '>'+
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

            footer.fadeIn(1200);
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

        else if(status === "personinserver") {

            onConnect.css("display", "none");
            personInserver.fadeIn(1200);

            console.log("[client] personinserver...");

            //userList.empty();
            userTablList.find('tbody').empty();

            //data 객체를 풀어서 현시한다..
            for(var i in data)
            {
                console.log("username : " + data[i].name + ", useraddress : " + data[i].address + ", interstedpart : " + data[i].part);
               /* var tmpmsg = "이름 : " + data[i].name + "\t" + "주소 : " + data[i].address + "\t" + "부위 : " + data[i].part;
                var li = $(
                    '<li id="li_"+i>'+
                    '<p></p>' +
                    '<b></b>' +
                    '</li>');
                // use the 'text' method to escape malicious user input
                li.find('p').text(tmpmsg);          //p 태그를 찾는다.
                li.find('b').text(data[i].clientId);
                userList.append(li);*/

/*                var tr = $(
                    '<tr>'+
                        '<td> i </td>'+
                        '<td> data[i].name</td>' +
                        '<td> data[i].address</td>' +
                        '<td> data[i].part</td>' +
                    '</tr>'
                );*/

                var tr = "<tr> <td> " + i + " </td>" +
                        "<td>" + data[i].name + "</td>" +
                        "<td>" + data[i].address + "</td>" +
                        "<td>" + data[i].part + "</td>" +
                        "<td hidden='true'>" + data[i].clientId + "</td>" +
                       "</tr>";

                userTablList.find('tbody').append(tr);


            }

            //li event connect
            $("#tblUserList tbody tr").click(function (e){

                console.log($(this).find("p").text() + ", id : " + $(this).find("td").eq(4).html());

                var clientId = $(this).find("td").eq(4).html()

                var roomId = Math.round((Math.random() * 1000000));

                console.log("clientId : " + clientId + ", roomId : " + roomId);

                socket.emit("chatwith", {clientId : clientId, roomId : roomId});

            });

            $("#btnRefresh").click(function () {
                console.log("Refresh button clicked..");
                socket.emit("refresh");
            });
        }

        else if(status === "chatfrom") {
            //쪽지를 보낸 상대방을 보여준다..
            personInserver.css("display", "none");
            $(".chatfrom").fadeIn(1200);

            console.log("fromname : " + data.fromUser);

            //화면에 말을 걸어온 사람을 보여준다.
            $("#fromName").val(data.fromUser);
            $("#fromAddress").val(data.fromAddress);
            $("#fromPart").val(data.fromPart);
            //ok
            $("#btnChatFromOk").click(function () {

                //두 사람간의 1:1 대화 연결결
                //var roomId = Math.round((Math.random() * 1000000));

                socket.emit("chatok", {roomId : data.fromRoomId, targetId : data.fromSocket});
                showMessage("chatStarted");
            });

            //cancel
            $("#btnChatFromCancel").click(function (){

            });

        }
    }

})
