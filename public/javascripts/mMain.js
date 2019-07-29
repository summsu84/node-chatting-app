/**
 * Created by JJW on 2016-11-14.
 */
/**
 * Created by JJW on 2016-11-10.
 */
// This file is executed in the browser, when people visit /chat/<random id>
var g_MAX_EA = 20;
var g_MAX_SET = 10


// $(function(){
	var tblClicked = false;
	var g_chats;				//채팅 글 저장 태그
	var userInfo;               //현재 로그인 사용자.
	var g_connUserList = new Array();		//현재 접속한 유저정보 저장
	var g_chatStatusList = new Array();	//채팅 목록 정보 저장
	var isSender = false;
	var g_clickedUsername;
	var g_clickedInfo = {
		userId : "",
		objectId : ""
	};
	var socket;
	var clientId;
// variables which hold the data for each person
	var name = "",
		address = "",
		interestedpart = "";

	var loginForm = $(".loginForm"),
		tabChatFrom = $(".divChatFrom"),
		tblFriend = $("#tblFriend"),
		yourName = $("#yourName"),
		yourAddress = $("#yourAddress"),
		chatScreen = $('.chatscreen'),
		footer = $("footer"),
		textarea = $("#message"),
		chats = $(".chats");


	var listViewConnStatus = $("#listViewMainConnStatus"),
		listViewFriendStatus = $("#listViewMainFriendStatus"),
		listViewChatStatus = $("#listViewMainChatStatus"),
		btnConnStatus = $(".btnMainConnStatus"),
		btnMainFriendStatus = $("btnMainFriendStatus"),
		btnMainChatStatus = $(".btnMainChatStatus"),
		btnMainSchedule = $(".btnMainSchedule"),
		btnMainChat = $("#btnMainChat"),
		btnMainProfileChat = $("#mainProfileChat")
		;

	var mIsChatShow = false;		//Chat열렸는지 여부..


	//initButtons();

	//FirendStatus 페이지 보여지는 경우..

	function initPageShow() {
		$('#mainConnStatus').bind('pageinit', function() {
			console.log("mainConnStatus pageinit..");
			$('#listViewMainConnStatus').listview('refresh');
		});

		$('#mainFriendStatus').bind('pageinit', function() {
			console.log("mainFriendStatus pageinit..");
			$('#listViewMainFriendStatus').listview('refresh');
		});

		$('#mainChatStatus').bind('pageinit', function() {
			console.log("mainChatStatus pageinit..");
			$('#listViewMainChatStatus').listview('refresh');
		});

		$('#mainFriendStatus').on('pageshow', function (event) {

			console.log("mainFriedStatus is show..");
			var id = getUrlVars()["id"];
		});

		//ChatStatus 페이지 보여지는 경우..
		$('#mainChatStatus').on('pageshow', function (event) {

			var userId = userInfo.userId;
			//서버에 해당 유저의 채팅정보를 가져온다..
			//main/chat/request
			$.get('/main/chatListRequest', {params: {userId: userId}})
				.success(
					function (success) {
						//console.log(success)
						//대화 목록을 생성한다. success는 Array..
						createMainChatList(success);
					})
				.error(
					function (error) {
						console.log(error)
					});
		});

		$('#mainConnStatus').on('pageshow', function (event) {

			console.log("mainConn is show..");
/*			$.post('/main/friendRequest', function (data) {
				console.log(data);

				createMainFriendList(data);
			});*/

		});

		//프로필 클릭 요청시
		$('#mainProfile').on('pageshow', function (event, data) {

			var userId = g_clickedInfo.userId;
			console.log("mainProfile is showing..data : " + data + ", userId : " + userId);

			//get 요청
			$.ajax({
				url: "/main/profileRequest/" + userId,
				type: "GET",
				success: function (data) {
					console.log("data.. : " + data);
					//여기에 프로파일 정보 보여준다..
					displayUserProfile(data);
				},
				error: function (request, status, error) {
					console.log(error);
				}
			});


		});

		//스케줄 작성 페이지 나타날때..
		$('#mainScheduleAdd').on('pageshow', function (e) {
			console.log("mainScheduleAdd is show");
			//initation
			initScheduleAdd();
		});

		$('#chatPage').on('pageshow', function (e) {
			console.log("chatPage is show");
			mIsChatShow = true;
		});

		$('#chatPage').on('pagechange', function (e) {
			console.log("chatPage is chaged");
			mIsChatShow = false;
		});
	}

	//서버에 접속자 정보를 요청한다.
/*	$.post('/main/request', function(data){
		console.log(data);
		userInfo = data.result;
		initSocket(data.result);
	});*/

	function initButtons() {
		$('.btnMainConnStatus').on('click', function (e) {
			e.preventDefault();

			console.log("btnConnStatus is clicked..");

			/*$.ajax({
				url: "/main/request",
				type: "POST",
				success: function (data) {

					console.log("data.. : " + data);


				},
				error: function (request, status, error) {
					console.log(error);
				}
			});*/

			$.mobile.changePage( "#mainConnStatus", { transition: "flip", changeHash: false });
			console.log("Refresh button clicked..");
			socket.emit("refresh");
		});

		/**친구 목록보기 페이지로 이동 한다.. */
		btnMainFriendStatus.on('click', function (e){

			e.preventDefault();
			$.mobile.changePage( "#mainFriendStatus", { transition: "flip", changeHash: false });
			$.post('/main/friendRequest', function(data){
				console.log(data);

				createMainFriendList(data);
			});

		});

		/**친구 목록보기 페이지로 이동 한다.. */
		btnMainChatStatus.on('click', function (e) {

			e.preventDefault();
			$.mobile.changePage("#mainChatStatus", {transition: "flip", changeHash: false});



		});

		/**스케줄 보기 페이지 이동 */
		btnMainSchedule.on('click', function(e){
			//나중에 ajax로 대체 예정..
			//사용자가 등록한 스케줄 정보를 불러온다.
			e.preventDefault();

			$.mobile.changePage('#mainSchedule', { transition: "flip", changeHash: false });

			$.post('/main/schedule/init', function(data){
				console.log(data);
				//데이터를 받아온다..부위
				var resultArray = data.result;

				displayUserSchedule(resultArray);
				//$('#scheduelMain ul').listview('refresh');
				if ( $('#scheduleList').hasClass('ui-listview')) {
					console.log("refresh!");
					$('#scheduleList').listview('refresh');
				}
				else {
					console.log("create!");
					$('#scheduleList').trigger('create');
				}
			});

			//requestPartNameInit();
		});

		//대화하기 버튼 클릭시 상대방과 대화를 한다..
		btnMainProfileChat.on('click', function(e){

			e.preventDefault();

			$.mobile.changePage('#chatPage', { transition: "flip", changeHash: false });

			//채팅 시작 하기
			var roomId = Math.round((Math.random() * 1000000));

			var clientObj = getConnectedClientInfo(g_clickedUsername);

			userInfo.clientUserId = g_clickedInfo.userId;
			userInfo.clientUserName = g_clickedInfo.userName;
			userInfo.clientObjectId = g_clickedInfo.objectId;
			userInfo.roomId = roomId;

			console.log("clientId : " + userInfo.clientUserId + ", roomId : " + roomId + ", clientUserName : " + userInfo.clientUserName);

			socket.emit("chatwith",
				{
					targetUserId : userInfo.clientUserId,
					roomId : roomId
				}
			);

		})

		//메시지를 보낸다.
		$("#chatSendButton").click(function(e) {

			e.preventDefault();

			var name = userInfo.name;
			var senderUserId = userInfo.userId;
			var receiverUserId = userInfo.clientUserId;
			var receiverUserName = userInfo.clientUserName;
			var receiverUserObjectId = userInfo.clientObjectId;

			console.log("userName : " + userInfo.name + ", userId : " + senderUserId + " , receiverId : " + receiverUserId + ", roomId : " + userInfo.roomId + ", receiverUserName : " + receiverUserName);

			if ($("#messageText").val().trim().length) {
				createChatMessage(userInfo, $("#messageText").val(), name, moment());

				// Send the message to the other person in the chat
				socket.emit('msg', {
					msg: $("#messageText").val(), user: name,
					receiverUserId : receiverUserId,
					senderUserId : senderUserId,
					roomId : userInfo.roomId,
					receiverUserObjectId : receiverUserObjectId,
					receiverUserName : receiverUserName
				});
			}

			$("#messageText").val("");
			$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);
		});

		//친구추가하기 이벤트
		$('#mainProfileAddFriend').on('click', function (e) {
			//현재 클릭한 아이디를 확인한다.
			console.log("mainProfileAddFriend button is clicked..");
			userInfo.clientUsername = g_clickedUsername;
			$.ajax({
				url: '/main/friendAdd/'+userInfo.name,
				type: 'PUT',
				dataType: 'json',
				data: {username: userInfo.name, friendname:userInfo.clientUsername},
				success: function(result) {
					console.log("result success : " + result.success);
					console.log("result error : " +  result.error);
				}
			});

		});

		/*$("#btn-login-submit").on('click', function (e) {
			e.preventDefault();

			var username = $("#txt-username").val();
			var userpassword = $("#txt-password").val();

			console.log("username : " + username + ", password : " + userpassword);

			$.post('/login2', {params: {username: username, password : userpassword}})
				.success(
					function (success) {
						//console.log(success)
						console.log("result : " + success.success)
																								//소켓 등록한다..
						//$.mobile.changePage( "#mainConnStatus", { transition: "flip", changeHash: false });
						$.mobile.changePage( "mMain.html", { transition: "flip", changeHash: false });

						//사용자에 대한 정보를 가져온다..

						$.get('/main/userInfoRequest', function(data){

							console.log(data);

							userInfo = data.result;

							initSocket(data.result);
						});
					})
				.error(
					function (error) {
						console.log(error)
					});
		});*/

		//Schedule Add Page
		//Day 추가 및 삭제
		$("#btnScheduleDayAdd").on('click', function(e){

			console.log("btnScheduleDayAdd is called.");
			e.preventDefault();
			//Day 추가한다..
			createDay();
		});
		$("#btnScheduleDayDelete").on('click', function(e){

			console.log("btnScheduleDayDelete is called.");
			e.preventDefault();
			//Day 추가한다..
			removeDay();
		});

		$("#btnScheduleAddSave").on('click', function (e) {

			e.preventDefault();

			createScheduleToJson();
		});

		$("#btnScheduleAddCancel").on('click', function (e) {

			e.preventDefault();

			$("#container2").empty();
		});

	}

	/**
	 *  아이디 정보로 클라이언트 전체 정보를 가져온다.
	 */
	function getConnectedClientInfo(userId)
	{
		var retVal={};
		for(var i in g_connUserList)
		{
			var obj = g_connUserList[i];
			if(obj.userId === userId)
			{
				retVal = obj;
				break;
			}
		}

		return retVal;
	}

    /**
     *  아이디 정보로 클라이언트 전체 정보를 가져온다.
     */
    function getConnectedClientInfobyUserName(userName)
    {
        var retVal={};
        for(var i in g_connUserList)
        {
            var obj = g_connUserList[i];
            if(obj.username === userName)
            {
                retVal = obj;
                break;
            }
        }

        return retVal;
    }



	//socket IO 설정
	function initSocket(result) {
		// on connection to server get the id of person's room
		socket = io();

		socket.on('connect', function () {
			//서버에 연결이 성공적일때, load  시그널을 보낸다.
			console.log("connected..to server..");
			//디비에 클라이언트 아이디를 저장한다..

			socket.emit('load', {
					result : userInfo
				}
			);
		});


		//서버로 부터 OK 메시지 수신..
		socket.on('chatok', function (data) {

			//chatScreen.find('p').remove();
			console.log("chatok roomId : " + data.roomId)
			var p =
				"<p> 상대방과 대화가 연결되었습니다. </p>";
			//chatScreen.prepend(p);

			//showMessage("chatStarted");
		});

		socket.on('receive', function(data){

			console.log("[receive] called..");
			if(data.msg.trim().length) {

				var fromName = data.user;
				console.log("[receive] fromName : " + fromName);

				//Sender인 경우
				if(g_clickedUsername === fromName)
				{
					createChatMessage(userInfo, data.msg, data.user, moment());
					$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);
				}else {

					//Receiver 인경우
					createChatMessage(userInfo, data.msg, data.user, moment());
					$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);

					if(mIsChatShow === true) {
						var chatObjectId = userInfo.chatObjectId;		//임시
						$.ajax({
							url: "/main/chatMsgCheckedUpdate/" + chatObjectId,
							type: "PUT",
							success: function (data) {

							},
							error: function (request, status, error) {
								console.log(error);
							}
						});
					}
					//chatMsg Checked == true로 변경한다.



					//1. 현재 채팅창이 열려 있는지 확인해야 한다. 만약 열려 있지 않으면 채팅 목록 창에 알람 표시 해주거나, 메시지 버퍼또는 서버에 저장해야 한다..
					/*for (var i in g_chatStatusList) {
						var obj = g_chatStatusList[i];
						console.log("[obj fromname : " + obj.fromUsername);
						if (obj.fromUsername === fromName) {
							if (obj.isClicked == true) {
								//메시지를 바로 보여준다.
								createChatMessage(userInfo, data.msg, data.user, moment());
								$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);
							} else {
								//메시지 버퍼를 생성한다.
								obj.msgBuffer.push(createChatMessageBuffer(userInfo, data.msg, data.user, moment(), 1));
							}
						}
					}*/
				}
			}
		});

		//로그인이 되엇을 경우..
		//현재 서버에 접속한 사람 수 보여주기..
		socket.on('peopleinserver', function (data) {

			showMessage("personinserver", data.connectedPeopleList);
			// Update the relative time stamps on the chat messages every minute
			setInterval(function () {
				// 60초 간격으로 전송한다..
			}, 60000);
		});

		//서버로 부터 메시지를 수신 초대
		//만약 하면 새로운 창을 띄운다.?
		socket.on('chatfrom', function (data) {

			var requestUser = data.requestUserInfo;

			console.log("chatfrom : " + requestUser.roomId);

			showMessage("chatfrom", requestUser);
			//ok emit
			socket.emit("chatok", {
				roomId : requestUser.roomId,
				requestUserId : requestUser.userId				//대화를 요청한 사용자 정보
			});
		});

		//서버로 부터 leave 메시지 수신..
		socket.on('leave',function(data) {

			console.log("leave msg received");
			data.msg = "상대방이 대화방을 나갔습니다.";
			createChatMessage(userInfo, data.msg, data.user, moment());
			$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);

/*			if (data.boolean && id == data.room) {

				showMessage("somebodyLeft", data);
				chats.empty();
			}*/
		});
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
		//접속자 정보를 가져온다..
		else if(status === "personinserver") {

			$("#listViewMainConnStatus").empty();

			while (g_connUserList.length > 0) {
				g_connUserList.pop();
			} // Fastest

			//data 객체를 풀어서 현시한다..
			for(var i in data)
			{

				//서버에 저장된 클라이언트 정보들.. 여기서 보여줄껀 보여주고, Hidden 처리할껀 Hidden 처리 하자.

				var li = "<li>"	+
					"<a href='#'>" +
						"<img src='../images/unnamed.jpg'>" + data[i].name + "" +
						"<p class='hidden' name='userId'>" + data[i].userId + "</p>" +
						"<p name='objectId'>" + data[i]._id + "</p>" +
					"</a>"+
					"</li>";

                //현재 접속한 사람들 리스트를 가져와서 Pool에 집어 넣는다.
				g_connUserList.push(data[i]);		//connection pool
                //현재 리스트와 사용자가 동일인인지 판단한다.
                if(userInfo.userId === data[i].userId)
                {
					$("#listViewMainConnStatus").prepend(li).listview('refresh');
                }else {

					$("#listViewMainConnStatus").append(li).listview('refresh');			//refresh를 해줘야 한다.
                }
			}

			//현재 사용자 목록 리스트 뷰 클릭 이벤트 설정하기..
			$('#listViewMainConnStatus').on('click', 'li', function(e) {
				e.preventDefault();

				var id = $(this).find("[name='userId']").html();
				var objectId = $(this).find("[name='objectId']").html();

				//mainProfile 이동
				g_clickedInfo.userId = id;
				g_clickedInfo.objectId = objectId;
				/*g_clickedUsername = id;*/

				$.mobile.changePage( "#mainProfile", { transition: "flip", changeHash: false });


			});

			//행 클릭 시 이벤트 연결
		}

		else if(status === "chatfrom") {
			//상대방 대화 목록에 리스트를 만든다.
			console.log("fromUserId : " + data.userId);

			//화면에 말을 걸어온 사람을 보여준다.
			//대화 목록 리스트를 만든다.
			createMainChatFromMsg(data);
			data.isClicked = false;
			data.msgBuffer = new Array();
			//대화 목록에 정보를 저장한다.
			g_chatStatusList.push(data);

		}else if(status === "somebodyLeft"){

		}
	}



	/**
	 * DB로 부터 받아온 친구 목록을 바탕으로 친구 목록 리스트를 만든다.
	 * @param data
	 */
	function createMainFriendList(data)
	{
		$('#listViewMainFriendStatus').empty();

		for(var i in data)
		{
			var li = createFriendLiHtml(i, data);

			$('#listViewMainFriendStatus').append(li).listview('refresh');


		}

		//리스트 클릭시 친구 프로필을 보기 위한 이벤트 등록 한다.
		$('#listViewMainFriendStatus').on('click', 'li', mainFriendProfile);
	}

	/**
	 *  친구 프로필을 선택하였을때, 프로필 정보 보여주기
	 * @param e
	 */
	mainFriendProfile = function(e)
	{
		e.preventDefault();

		console.log("mainFriendProfile is called..");

		var userId = $(this).find('h3').html();
		var userName = $(this).find('h2').html();
		var userObjectId = $(this).find('p.objectId').html();
		console.log("mainFriendProfile is called.. userId : " + userId + ", userName : " + userName);
		g_clickedInfo.userId = userId;		//임시
		g_clickedInfo.userName = userName;
		g_clickedInfo.objectId = userObjectId;

		$.mobile.changePage( "#mainProfile", { transition: "flip", changeHash: false });

	}

	/**
	 * 대확 목록에 데이터를 이용하여 테이블을 생성한다.
	 * @param data
	 */
	function createMainChatList(data)
	{
		console.log("crateChatList is calle.");

		$("#listViewMainChatStatus").empty();

		var result = data;
		for(var i in result)
		{
			var obj = result[i];

			var li = createChatLiHtml(i, obj);
			//console.log("msgList : " + msgList);

			$("#listViewMainChatStatus").append(li).listview('refresh');
		}
		$("#listViewMainChatStatus").find('li').on('click', displayChatContent);
	}

	/**
	 *  상대방으로 부터 메시지가 왔을 때, 메시지 리스트에 추가 한다.
	 */
	function createMainChatFromMsg(data)
	{
		var i = $("#listViewMainChatStatus").length;
		//var date = moment();
		var withName = data.username;
		var li = createChatLiHtml(i, moment(), withName);

		li.find('a').attr('id', data.userId);

		$("#listViewMainChatStatus").append(li).on("click", displayChatContent)
		//$('#listViewMainChatStatus p').hide();
	}

	function createFriendLiHtml(i, data)
	{
/*		var li = "<li>"	+
			"<a href='#'>" +
			"<img src='../images/unnamed.jpg'>" +
			"<h2>" + data[i].name + "</h2>" +
			"<p>" + data[i].online + "</p>"+
			"</a>"+
			"</li>";*/
		console.log("objectId : " + data[i]._id);

		var li = $('<li>').append($('<a>').attr({'href' : '#'}).append($('<img>').attr({'src':'../images/unnamed.jpg'})).
		append($('<h2>').append(data[i].name)).
		append($('<h3>').append(data[i].userId)).
		append($('<p>').attr({'class' : 'objectId'}).append(data[i]._id)).
		append($('<p>').append(data[i].online)));

		return li;
	}

	function createChatLiHtml(i, obj)
	{

        var msg = obj.msg;
        var created = obj.created;
        var name = obj.name;
        var chatObjectId = obj.chatObjectId;
        var uncheckedMsgCount = obj.unchecekdMsgCount;
        var friendUserName = obj.friendUserName;
		var friendObjectId = obj.friendObjectId;

		var li = $(
			'<li>'+
			'<a href="#">' +
			'<img src="../images/unnamed.jpg">' +
			'<h3>' + friendUserName + '</h3>' +
			'<h4>' + msg + '</h4>'+
			'<p class="chatObjectId">' + chatObjectId + '</p>' +
			'<p class="friendObjectId">' + friendObjectId + '</p>' +
			'<span class="ui-li-count">' + uncheckedMsgCount + '</span>'+
			'</a>'+
			'</li>');



		return li;
	}

	/**
	 *  채팅 목록에서 특정 채팅을 선택하여 채팅에 연결한다.
	 */
	function displayChatContent()
	{

        //1. friendObjectId를 가져온다.
        var friendObjectId = $(this).find('p.friendObjectId').html();

		$.mobile.changePage('#chatPage', { transition: "flip", changeHash: false });

		var chatObjectId = $(this).find('p').html();
		userInfo.chatObjectId = chatObjectId;

		console.log("displayChatContent chatObjectId : " + chatObjectId + ", friendObjectId ; " + friendObjectId);

		//1. chatobjectId를 이용하여 chatMsg를 가져온다.
		$.ajax({
			url: "/main/chatDetailRequest/" + chatObjectId,
			type: "GET",
			success: function (data) {
				console.log("chat History.. : " + data);
				//여기에 프로파일 정보 보여준다..
				for(var i in data)
				{
					var tmp = data[i];
					createChatMessageFromDB(userInfo, tmp.msg, tmp.user, tmp.created);

				}
				updateCheckedMsg(chatObjectId, friendObjectId);

			},
			error: function (request, status, error) {
				console.log(error);
			}
		});

		//2. 채팅창을 오픈한다.
		//$.mobile.changePage('#chatPage', { transition: "flip", changeHash: false });
	}


    /**
     *
     */
    function updateCheckedMsg(chatObjectId, friendObjectId)
    {
		console.log("updateCheckedMsg : " + chatObjectId + ", friendObjectId : " + friendObjectId);
        $.ajax({
            url: "/main/chatMsgCheckedUpdate/" + chatObjectId,
            type: "PUT",
            success: function (data) {

				//채팅 룸 설정하기..
                $.ajax({
                    url: "/main/chatRoomIDRequest/" + chatObjectId,
                    type: "GET",
                    success: function (data) {

                        //roomId가 없는 경우.
                        var roomId = 0;
                        if(!data.hasOwnProperty('roomId'))
                        {
                            //룸 ID 설정한다.
                            //채팅 시작 하기
							console.log("room id is not exsist");
                            roomId = Math.round((Math.random() * 1000000));


                        }else {
                            //소켓에 룸아이디 설정한다.
							console.log("chatRoom is found.. roomId : " + data.roomId);
                            roomId = data.roomId;
                        }
                        //userId를 찾자..접속 안되어 있으면 없다.
                        //var clientObj = getConnectedClientInfobyUserName(data.friendUserName);
						//대상 클라이언트 정보를 요청하자..


                       // console.log("/main/chatRoomIDRequest result userid : " + clientObj.userId + ", roomId : " + roomId);

						$.ajax({
							url: "/main/profileRequestByObjectId/" + friendObjectId,
							type: "GET",
							success: function (data) {

								var userId = data.userId;
								userInfo.clientUserId = userId;
								userInfo.clientObjectId = data._id;
								userInfo.clientUserName = data.name;
								userInfo.roomId = roomId;


								socket.emit("chatwith",
									{
										targetUserId : userId,
										roomId : roomId
									}
								);
							},
							error: function (request, status, error) {
								console.log(error);
							}
						});



                    },
                    error: function (request, status, error) {
                        console.log(error);
                    }
                });

            },
            error: function (request, status, error) {
                console.log(error);
            }
        });
    }





/**
 * 사용자 정보를 보여준다..
 * @param data
 */
function displayUserProfile(data) {

	console.log(data.userId);

    //사용자와 일치하는지 판단한다.

	$('#employeePic').attr('src', '../images/unnamed.jpg');
	$('#userName').text(data.userId);
	$('#name').text(data.name);
	$('#address').text(data.gu);
	//console.log(employee.officePhone);

	//관심 부위
	$('#actionList').append('<li><a href="#"><h3>관심 부위</h3>' +
		'<p>' + data.interestedPart + '</p></a></li>');

	//체형
	$('#actionList').append('<li><a href="#"><h3>체형</h3>' +
		'<p>' + data.bodyType + '</p></a></li>');

	$('#actionList').append('<li><a href="#"><h3>강한 부위</h3>' +
		'<p>' + data.strongPart + '</p></a></li>');

	$('#actionList').append('<li><a href="#"><h3>약한 부위</h3>' +
		'<p>' + data.weakPart + '</p></a></li>');

	$('#actionList').listview('refresh');

/*
	if (employee.managerId>0) {
		$('#actionList').append('<li><a href="employeedetails.html?id=' + employee.managerId + '"><h3>View Manager</h3>' +
			'<p>' + employee.managerFirstName + ' ' + employee.managerLastName + '</p></a></li>');
	}
	if (employee.reportCount>0) {
		$('#actionList').append('<li><a href="reportlist.html?id=' + employee.id + '"><h3>View Direct Reports</h3>' +
			'<p>' + employee.reportCount + '</p></a></li>');
	}
	if (employee.email) {
		$('#actionList').append('<li><a href="mailto:' + employee.email + '"><h3>Email</h3>' +
			'<p>' + employee.email + '</p></a></li>');
	}
	if (employee.officePhone) {
		$('#actionList').append('<li><a href="tel:' + employee.officePhone + '"><h3>Call Office</h3>' +
			'<p>' + employee.officePhone + '</p></a></li>');
	}
	if (employee.cellPhone) {
		$('#actionList').append('<li><a href="tel:' + employee.cellPhone + '"><h3>Call Cell</h3>' +
			'<p>' + employee.cellPhone + '</p></a></li>');
		$('#actionList').append('<li><a href="sms:' + employee.cellPhone + '"><h3>SMS</h3>' +
			'<p>' + employee.cellPhone + '</p></a></li>');
	}
	$('#actionList').listview('refresh');*/

}

/**
 * 사용자의 스케줄을 본다..
 * @param data
 */
function displayUserSchedule(data) {

	var idx = 1;
	var container = $("#container1");
	for(var i in data)
	{
		var scheduleArray = data[i];

		//var dayUl = crateScheduleLiDayHtml(scheduleArray.day);
		//$('#scheduelMain').append(dayUl);


		var exList = scheduleArray.ex;
		var tmpStr = "scheduleList_" + scheduleArray.day;
		var listId = "#" + tmpStr;

		container.append($('<h3>').append(idx + "일")).append($('<ul>').attr({'data-role' : 'listview', 'id' : tmpStr, 'data-inset' : 'true'})).trigger("create");
		//var schedueListSelector = $('#scheduelMain').find(tmpStr);
		for(var j in exList)
		{
			var ex = exList[j];

			//var partName = crateScheduleLiDividerHtml(ex.partName);

			$('<li>').attr({ 'data-role' :'list-divider'}).append(ex.partName).appendTo(listId);
			var partExList = ex.exList;

			//$('#scheduleList').append(partName);
			//schedueListSelector.append(partName);

			for(var k in partExList)
			{
				var ex = partExList[k];
				//var exli = crateScheduleLiHtml(ex.exName, ex.exEa, ex.exSet);

				$('<li>').append("<a href='#'>" + ex.exName + " X " + ex.exEa + " -- " + ex.exSet + "</a>").appendTo(listId);

				//$('#scheduleList').append(exli);
				//schedueListSelector.append(exli);
			}
		}
		idx++;
	}
	$("#container1 ul").listview('refresh');
	//test();
}

function crateScheduleLiDayHtml(day)
{

	var tmpstr = "scheduleList_" + day;

	var ul = '<ul id="' + tmpstr + '"' + ' data-role="listview" ></ul>';

	return ul;
}

function crateScheduleLiDividerHtml(partName)
{
	var li = "<li data-role='list-divider'>" + partName + "</li>";
	return li;
}

function crateScheduleLiHtml(exName, exEa, exSet)
{
	var li = "<li><a href='#'>" +
		exName + " X " + exEa + " -- " + exSet +
		"</a></li>";

	return li;
}

function test()
{
	var i = 0;


	var container = $("#container1"), UL = container.find("#listView2");
	if (UL.length) {
		UL.append('<li><a href="#">List Item - ' + (++i) + '</a></li>').listview("refresh");
	} else {

		//container.append('<ul data-role="listview" id="listView2"><li><a href="#">List Item - ' + (++i) + '</a></li></ul>').trigger("create");
		//$('<ul>').attr({'data-role' : 'listview', 'id' : 'listView2'}).append("<li><a href=''> listview!! </a></li>").appendTo('#container1').trigger("create");
		container.append($('<ul>').attr({'data-role' : 'listview', 'id' : 'listView2'}).append("<li><a href=''> listview!! </a></li>")).trigger("create");
		/*$('<li>').append("ListItem!!").appendTo('#listView2');
		$("#listView2").listview('refresh');*/
	}

}

function createChatMessage(userInfo, msg,user,now){

	var who = '';
	name = userInfo.name;

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

	$('#incomingMessages').append(li);

	messageTimeSent = $(".timesent");
	messageTimeSent.last().text(now.fromNow());
}

function createChatMessageFromDB(userInfo, msg,user,now){

	var who = '';
	name = userInfo.name;

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
		'<i class="timesent" data-time=' + now + '>now</i> ' +
		'</div>' +
		'<p></p>' +
		'</li>');

	// use the 'text' method to escape malicious user input
	li.find('p').text(msg);
	li.find('b').text(user);

	$('#incomingMessages').append(li);

}

//flag : 0 서버로 가져온경우, 1 이면 실시간 메시지
function createChatMessageBuffer(userInfo, msg,user,now,flag){

	var who = '';
	name = userInfo.username;

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

	//$('#incomingMessages').append(li);

	if(flag === 1) {
		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	return li;
}

function initScheduleAdd()
{
	var idx = 1;
	var container = $("#container2");

	//Part
	/*var divName = "divDay_" + idx;
	var divContainer = $('<div>').attr({"id":divName, "class" : "divContainer" });
	divContainer.appendTo(container);*/

	var subContainer = createDay();
	var partName;
	var exName, exEa, exSet;

	// container.append(day);
/*	createPartNameHtml(divContainer, idx);
	createExHtml(divContainer, idx);*/


}

function genDayHtml()
{

}
/**
 * Day 부분을 만든다.
 * @param parent
 * @param idx
 * @returns {String|*|jQuery}
 */
function createDay(parent, idx)
{
	//div conrtainer 개수를 확인한다.
	var container = $("#container2");
	var nextIdx = container.find('.divContainer').length + 1;
	console.log("nextIdx : " + nextIdx);
	if(nextIdx > 7) return;

	//Part
	var divName = "divDay_" + nextIdx;
	var divContainer = $('<div>').attr({"id":divName, "class" : "divContainer" });
	divContainer.appendTo(container);

	//field contain
	var div = $('<div>').attr({"data-role" : "fieldcontain" });
	var day = $('<h3>').append(nextIdx + "일");

	//+ - 생성
	var fieldset = $('<fieldset>').attr({'data-role':'controlgroup', 'data-type':'horizontal'});
	var plus = $('<a>').attr({'href': '#', 'data-role' : 'button', 'data-inline' : 'true', 'data-theme':'a', 'data-icon':'plus'}).append("부위더하기");
	var minus = $('<a>').attr({'href': '#', 'class' : 'ui-alt-icon ui-btn ui-shadow ui-corner-all ui-icon-minus ui-btn-icon-left'}).append("부위삭제");


	//부위 더하기
	plus.on('click', function (e) {
		e.preventDefault();
		var divContainer = findDivContainer($(this), '.divContainer');
		var idArray = divContainer.attr('id').split("_");
		var id = idArray[idArray.length - 1];
		console.log("divContainder idx : " + divContainer.attr('id') + ", idArray : " + idArray + ", id : " + id);
		createPart(divContainer, id);
	});
	minus.on('click', function (e) {
		e.preventDefault();
		//해당 Day Container를 찾는다.
		var divContainer = findDivContainer($(this), '.divContainer');

		removePart(divContainer);
	});

	div.append(day).append(fieldset.append(plus).append(minus)).appendTo(divContainer);
	divContainer.trigger('create');


	return divContainer;
}

/**
 *  Day 를 삭제 한다..
 * @returns {String|*|jQuery}
 */
function removeDay()
{
	//div conrtainer 개수를 확인한다.
	var container = $("#container2");

	var length = container.find('.divContainer').length;

	console.log("length : " + length);
	var lastDivContainer = container.find('.divContainer').last();
	if(length > 1)
		lastDivContainer.remove();

}

function findDivContainer(btn, str)
{
	var divContainer = btn.closest(str);

	return divContainer;
}

//day를 추가한다..
function handlerDayHtml()
{
	console.log("handlerdayHtml is called..");
	var container = $('#container2');
	var idx = container.find($('div')).length;
	console.log("idx : " + idx);
	//createDay()
}

//day를 제거한다..
function handlerDayMinus()
{
	console.log("handlerdayHtml is called..");
}
/**
 *  Part를 생성한다..
 * @param divContainer
 * @param idx
 */
function createPart(divContainer, idx)
{

	//Part 부분 더하기
	//클릭한 container idx를 검색한다.
	var nextIdx = divContainer.find('.partContainer').length + 1;
	console.log("nextIdx : " + nextIdx);
	var divName = "divPart_" + nextIdx;
	var partContainer = $('<div>').attr({"id":divName, "class" : "partContainer" });

	var partName = "sel-partName-" + nextIdx;
	var label = $('<label>').attr({'for' : partName}).append("부위");
	//+ - 생성
	var fieldset = $('<fieldset>').attr({'data-role':'controlgroup', 'data-type':'horizontal'});
	var plus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-plus ui-btn-icon-notext'});
	var minus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-notext'});


	var selPart = ($('<select>').attr({'name' : partName, 'id' : partName}));
	partContainer.append(label).append(fieldset.append(plus).append(minus)).append(selPart);
	partContainer.appendTo(divContainer).trigger('create');

	plus.on('click', function (e) {
		e.preventDefault();
		var partContainer = findDivContainer($(this), '.partContainer');
		var idArray = partContainer.attr('id').split("_");
		var id = idArray[idArray.length - 1];
		console.log("divPartContainer idx : " + partContainer.attr('id') + ", idArray : " + idArray + ", id : " + id);
		var selectedPartName = "#sel-partName-" + id;
		var selectedPart = partContainer.find(selectedPartName);
		createEx(partContainer, id, selectedPart, requestPartEx, 1);		// flag == 1 이면, Ex만 추가 하는 경우
	});
	minus.on('click', function (e) {
		e.preventDefault();
		var partContainer = findDivContainer($(this), '.partContainer');

		removeEx(partContainer);
	});

	createEx(partContainer, idx, selPart, requestPartName, 0);		//flag == 0 이면, 최초 파트 생성시..

	//requestPartName(selPart);

}

function removePart(divContainer)
{
	//partContainer 개수를 확인한다.
//	var container = $("#container2");

	var length = divContainer.find('.partContainer').length;
	console.log("removePart length.. " + length);
	var lastDivContainer = divContainer.find('.partContainer').last();
	if(length > 1)
		lastDivContainer.remove();

}

/**
 *  Ex 생성한다.
 * @param divContainer
 * @param idx
 */
function createEx(divContainer, idx, selPart, callback, flag)
{
	//Ex 만든다.
	//var exLabel = $('<label>').attr({'for' : partName}).append("운동일정");
	//+ - 생성

	//exDiv 생성
	var nextIdx = divContainer.find('.exContainer').length + 1;
	console.log("nextIdx : " + nextIdx);
	var divName = "divEx_" + nextIdx;
	var exContainer = $('<div>').attr({"id":divName, "class" : "exContainer" });

	var exName = "sel-exName-" + nextIdx;
	var exEa = "sel-exEa-" + nextIdx;
	var exSet = "sel-exSet-" + nextIdx;

	var fieldset = $('<fieldset>').attr({'data-role' : 'controlgroup', 'data-type' : 'horizontal'});
	var exNameLabel = $('<label>').attr({'for' : exName}).append("명칭");
	var exEaLabel = $('<label>').attr({'for' : exEa}).append("개수");
	var exSetLabel = $('<label>').attr({'for' : exSet}).append("세트");

	var exNameSel = ($('<select>').attr({'name' : exName, 'id' : exName})).append($('<option>').append("명칭"))
	var exEaSel =  ($('<select>').attr({'name' : exEa, 'id' : exEa})).append($('<option>').append("개수"))
	var exSetSel = ($('<select>').attr({'name' : exSet, 'id' : exSet})).append($('<option>').append("세트"))

	console.log("exname : " + exNameSel.attr('id') + ", exea : " + exEaSel.attr('id'));

	fieldset.append(exNameLabel).append(exNameSel).append(exEaLabel).append(exEaSel).append(exSetLabel).append(exSetSel).appendTo(exContainer);
	exContainer.appendTo(divContainer).trigger('create');

	if(flag === 0)
		callback(selPart);
	else {

		//requestPartEx($(this).val(), partContainer);
		callback(selPart.val(), divContainer);
	}

}
/**
 *  Ex 리스트를 제거한다.
 * @param divContainer
 */
function removeEx(partContainer)
{
	//partContainer 개수를 확인한다.
//	var container = $("#container2");

	var length = partContainer.find('.exContainer').length;
	console.log("removePart length.. " + length);
	var lastDivContainer = partContainer.find('.exContainer').last();
	if(length > 1)
		lastDivContainer.remove();

}


function createPartNameHtml(parent, idx)
{
	var divName = "divDay_" + idx;
	var partName = "sel-partName-" + idx;
	console.log("partName : " + partName);
	var label = $('<label>').attr({'for' : partName}).append("부위");
	//+ - 생성
	var fieldset = $('<fieldset>').attr({'data-role':'controlgroup', 'data-type':'horizontal'});
	var plus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-plus ui-btn-icon-notext'});
	var minus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-notext'});
	parent.append(label).append(fieldset.append(plus).append(minus));

	var partName = ($('<select>').attr({'name' : partName, 'id' : partName}))

	//var icon = $('<a>').attr({'href' : '#', 'class' : 'ui-btn-right ui-btn-inline ui-icon-delete ui-btn-icon-notext'});

	parent.append(partName).trigger("create");

	var exLabel = $('<label>').attr({'for' : partName}).append("운동일정");
	//+ - 생성
	var exfieldset = $('<fieldset>').attr({'data-role':'controlgroup', 'data-type':'horizontal'});
	var explus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-plus ui-btn-icon-notext'});
	var exminus = $('<a>').attr({'href': '#', 'class' : 'ui-btn ui-btn-inline ui-icon-delete ui-btn-icon-notext'});
	parent.append(exLabel).append(exfieldset.append(explus).append(exminus));


	plus.on('click', function (e) {
		e.preventDefault();
		var divContainer = $(this).closest('.divContainer');
		//console.log("id : " + id);
		handlerPartHtml(divContainer);
	})
	minus.on('click', function (e) {
		e.preventDefault();
		handlerPartMinus();
	})
}


function createScheduleToJson()
{

	var dayList = new Array();
	var scheduleContainer = $("#container2");

	scheduleContainer.find('.divContainer').each(function (index){
		console.log("divContainer Id : " + $(this).attr('id'));
		var dayObj = {};

		//partContainer를 찾는다.
		var ex = new Array();

		$(this).find(".partContainer").each(function (index){

			var idx = index + 1;
			var partName = $(this).find("#sel-partName-" + idx).val();
			var exList = new Array();
			//exList를 찾는다.
			$(this).find(".exContainer").each(function (index){

				console.log("exContainer..id : " + $(this).attr('id'));
				var idx = index + 1;
/*				var strexName = "sel-exName-" + idx;
				var strexEa = "sel-exEa-" + idx;
				var strexSet = "sel-exSet-" + idx;*/

				var exName = $(this).find("#sel-exName-" + idx).val();
				var exEa = $(this).find("#sel-exEa-" + idx).val();
				var exSet = $(this).find("#sel-exSet-" + idx).val();

				var exObj = {};
				exObj.exName = exName;
				exObj.exEa = exEa;
				exObj.exSet = exSet;
				exList.push(exObj);
			});

			var partObj = {};
			partObj.partName = partName;
			partObj.exList = exList;

			ex.push(partObj);
		});

		var idArray = $(this).attr('id').split("_");
		var id = idArray[idArray.length - 1];
		dayObj.day = id;
		dayObj.ex = ex;

		dayList.push(dayObj);

	});

	//서버에 저장한다..
	$.post('/main/schedule/save', {params: {schedule: dayList}})
		.success(
			function (success) {
				//console.log(success)
				var resultArray = success.result;


			})
		.error(
			function (error) {
				console.log(error)
			});

}



//day를 추가한다..
function handlerPartHtml(divContainer)
{
	console.log("handlerPartHtml is called..");

	//부모의 day를 검색한다..
	divContainer
	createPartNameHtml(divContainer, 2);




	//createDay()
}

//day를 제거한다..
function handlerPartMinus()
{
	console.log("handlerdayHtml is called..");
}


function createExHtml(parent, idx)
{
	var exName = "sel-exName-" + idx;
	var exEa = "sel-exEa-" + idx;
	var exSet = "sel-exSet-" + idx;

	var fieldset = $('<fieldset>').attr({'data-role' : 'controlgroup', 'data-type' : 'horizontal'});
	var exNameLabel = $('<label>').attr({'for' : exName}).append("명칭");
	var exEaLabel = $('<label>').attr({'for' : exEa}).append("개수");
	var exSetLabel = $('<label>').attr({'for' : exSet}).append("세트");

	var exNameSel = ($('<select>').attr({'name' : exName, 'id' : exName})).append($('<option>').append("명칭"))
	var exEaSel =  ($('<select>').attr({'name' : exEa, 'id' : exEa})).append($('<option>').append("개수"))
	var exSetSel = ($('<select>').attr({'name' : exSet, 'id' : exSet})).append($('<option>').append("세트"))

	fieldset.append(exNameLabel).append(exNameSel).append(exEaLabel).append(exEaSel).append(exSetSel).append(exSetSel);

	//parent.append(exNameLabel).append(exNameSel).append(exEaLabel).append(exEaSel).trigger("create");
	parent.append(fieldset).trigger("create");



	//parent.append(partName).trigger("create");

}

/**
 *  파트 콤보박스가 만들어지면, 내용을 요청한다.
 * @param lastSelPart
 */
function requestPartName(lastSelPart)
{
	//var l_selPart = lastSelPart.find('#selPart');
	var l_selPart = lastSelPart;
	//var divExList = lastSelPart.find("#divExList");
	console.log("requestPaaramname.. called..selector : " + l_selPart);

	$.ajax({
	 url: "/main/schedule/requestPart",
	 type: "POST",
	 success: function (data) {

	 console.log("data.. : " + data);
		 var resultArray = data.result;



		 var option = $('<option>').attr({'value':'0'}).append("");
		 l_selPart.append(option);


		 for(var i in resultArray)
		 {
			 var option = document.createElement("option");
			 option.text = resultArray[i];
			 option.value = resultArray[i];

			 l_selPart.append(option);
		 }

		 //Exercise 부분 값 가져오기..이벤트 등록하기..
		 l_selPart.on('change', function(e){
			 //requestPartEx..
			 console.log("change click");
			 if($(this).val() !== 0) {
				 //divPartContainer를 찾는다.
				 var partContainer = findDivContainer($(this), '.partContainer');
				 requestPartEx($(this).val(), partContainer);



			 }
		 });

	 },
	 error: function (request, status, error) {
	 console.log(error);
	 }
	 });


	/*$.post('/main/schedule/requestPart', function(data){
		console.log(data);
		//데이터를 받아온다..부위
		var resultArray = data.result;



		var option = $('<option>').attr({'text' : '', 'value':'0'})
		l_selPart.append(option);


		for(var i in resultArray)
		{
			var option = document.createElement("option");
			option.text = resultArray[i];
			option.value = resultArray[i];

			l_selPart.append(option);
		}

		//Exercise 부분 값 가져오기..이벤트 등록하기..
		l_selPart.on('change', function(e){
			//requestPartEx..
			console.log("change click");
			if($(this).val() !== 0) {
				//Ex Selector을 보내야 한다..
				var divPartList = $(this).closest('.part-list');            //상위 클래스 중 한개 찾기.
				console.log("divpart : " + divPartList);
				var divExList = divPartList.find("#divExList");
				requestPartExInit($(this).val(), divExList);
			}
		});
	});*/
}


//Ex 리스트를 불러온다..
function requestPartEx(partName, partContainer)
{
	//Selector 정하기..

	console.log("requestPartExInit.. called.. + selected value : " + partName);

	//먼저 Ex들을 모두 Empty 시킨다.
	//part Selector의 상위 태그에서 Ex 태그로 접근한다.

	// $("select").each(function(){
/*	divExList.find('select').each(function (){
		console.log("selEx .. : " + $(this).attr('name'));
		if($(this).attr('id') === 'selEx') {
			$(this).empty();
		}else if($(this).attr('id') === 'selSet') {
			$(this).empty();
		}
	});*/


	$.post('/main/schedule/requestPartEx', {params: {partName: partName}})
		.success(
			function (success) {
				//console.log(success)
				var resultArray = success.result;
                partContainer.find('.exContainer').each(function (index){

                    console.log("excontainer.. id : " + $(this).attr('id') + ", index : " + index);
                    var idx = index + 1;
                    var exName = "#sel-exName-" + idx;
                    var exEa = "#sel-exEa-" + idx;
                    var exSet = "#sel-exSet-" + idx;
                    console.log("exName : " + exName + ", exEa : " + exEa);
                    //해당 콤보박스를 찾는다.
                    var selEx = $(this).find(exName);
                    var selEa = $(this).find(exEa);
                    var selSet = $(this).find(exSet);
					console.log("selExId : " + selEx.attr('id)'));
                    for (var i in resultArray) {
                        var exName = resultArray[i].name;
                        var option = $('<option>').attr({'value':exName}).append(exName);
                        selEx.append(option);
                    }
                    for (var i = 0; i < g_MAX_EA ; i++) {

                        var option = $('<option>').attr({'value':i + 1}).append(i + 1);

                        selSet.append(option);
                    }
                    for (var i = 0; i < g_MAX_SET ; i++) {

                        var option = $('<option>').attr({'value':i + 1}).append(i + 1);

                        selEa.append(option);
                    }

                    selSet.selectmenu('refresh');
                });

			})
		.error(
			function (error) {
				console.log(error)
			});

/*	console.log("requestPartExInit.. divExList : " + divExList);
	requestPartEx(partName, divExList);*/
}


/*

PUBNUB.subscribe({
	channel  : 'chat',
	callback : function(text) {
		$("#incomingMessages").append("<div class='message'><span class='username'>" + "></span> " + text + "</div>");
		$("#incomingMessages").scrollTop($("#incomingMessages")[0].scrollHeight);

	}

});


/!*$("#chatNameButton").click(function(){
	chatName = $("#chatNameText").val();
	if(chatName.length <= 0)
		chatName = "unknown";

	$(location).attr('href',"#chatPage");
});*!/

$("#chatSendButton").click(function(){

	PUBNUB.publish({
		channel : "chat",
		message : chatName + " : " + $("#messageText").val()
	})
	$("#messageText").val("");
});*/
