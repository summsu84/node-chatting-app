/**
 * Created by JJW on 2016-11-14.
 */
/**
 * Created by JJW on 2016-11-10.
 */
// This file is executed in the browser, when people visit /chat/<random id>

$(function(){

	var tblClicked = false;
	var g_chats;				//채팅 글 저장 태그

	var userInfo;               //현재 로그인 사용자.
	var socket;
	var clientId;

	// variables which hold the data for each person
	var name = "",
		address = "",
		interestedpart = "";

	var loginForm = $(".loginForm"),
		tabLogin = $(".divLogin"),
		tabChatFrom = $(".divChatFrom"),
		tabConnStatus = $("#tabConnStatus"),
		tabChatStatus = $("#tabChatStatus"),
		tabOther = $("#tabOther"),
		tabOtherProfile = $("#tabOtherProfile"),
		tabOtherFriend = $("#tabOtherFriend"),
		tabOtherSchedule = $("#tabOtherSchedule"),
		tabFriend = $("#tabFriend"),
		tcConnStatus = $("#tcConnStatus"),
		tcChatStatus = $("#tcChatStatus"),
		tcOther = $("#tcOther"),
		tcFriend = $("#tcFriend"),
		tblConnStatus = $("#tblConnStatus"),
		tblChatStatus = $("#tblChatStatus"),
		tblFriend = $("#tblFriend"),
		yourName = $("#yourName"),
		yourAddress = $("#yourAddress"),
		yourInterestedPart = $("#yourInterestedPart"),
		dg_username = $("#dg_username"),
		dg_name = $("#dg_name"),
		dg_address = $("#dg_address"),
		dg_interestedPart = $("#dg_interestedPart"),
		dg_bodyType = $("#dg_bodyType"),
		dg_weakPart = $("#dg_weakPart"),
		dg_strongPart = $("#dg_strongPart"),
		btnAddFriend = $("#btnAddFriend"),
		btnMatChat = $("#btnMakeChat"),
		btnBlock = $("#btnBlock"),
		chatScreen = $('.chatscreen'),
		footer = $("footer"),
		textarea = $("#message"),
		chats = $(".chats"),
		chatForm = $("#chatform"),
		chatFomFromChat = $("#chatformFromChat"),
		textareaFromChat = $("#messageFromChat"),

		profileForm = $("#profileForm");



	//테이블 색상


	//접속 현황 클릭시 이벤트 연결..
	tabConnStatus.on('click', function (e){
/*		$(".tablinks").each(function(){
			$(this).parent().removeClass("active");
		});*/

/*		$(".panel-body  .panel").each(function(){
			$(this).css('display', 'none');
		});*/
		removeAppendElement();

		$("#tcConnStatus").css('display', 'block');
		//$(this).parent().addClass("active");
	});

	//채팅 목록 이벤트 연결하기..
	tabChatStatus.on('click', function (e){
/*		$(".tablinks").each(function(){
			$(this).parent().removeClass("active");
		});*/
/*		$(".panel-body  .panel").each(function(){
			$(this).css('display', 'none');
		});*/

		removeAppendElement();

		$("#tcChatStatus").css('display', 'block');
		//$(this).parent().addClass("active");

		//리스트를 가져오자...단, 탭을 클릭할때 마다 가져올지, 단순히 div만 보여주고 안보여주고로 할지 생각하자..최초 불러 올때 한번 불러올지..
		//일단, 클릭형식
		var username = userInfo.username;
		$.post('/main/chat/request', {params: {username: username}})
			.success(
				function (success) {
					//console.log(success)
					console.log("result : " + success)
					//대화 목록을 생성한다.
					createChatList(success);
				})
			.error(
				function (error) {
					console.log(error)
				});
	});

	tabOther.on('click', function (e) {
/*		$(".tablinks").each(function () {
			$(this).parent().removeClass("active");
		});*/
		$(".panel-body  .panel").each(function () {
			$(this).css('display', 'none');
		});

		$("#tcOther").css('display', 'block');
	//	$(this).parent().addClass("active");
	});

		//이벤트 걸어주기..설정 이벤트
	tabOtherProfile.on('click', function(){

		removeAppendElement();
/*
		$("#dialog").fadeIn(1200);

		//정보 입력후 아이디 설정 못하도록 막기
		$("#dg_name").val(userInfo.name);
		$("#dg_address").val(userInfo.address);
		$("#dg_interestedPart").val(userInfo.interestedPart);
		$("#dg_weakPart").val(userInfo.weakPart);
		$("#dg_strongPart").val(userInfo.strongPart);
		$("#dg_bodyType").val(userInfo.bodyType);

		/!*$("#btnAddFriend").html("수정하기");
		$("#btnMakeChat").html("초기화");
		$("#btnBlock").html("취소하기");*!/*/
		$.post('/main/profile', function(data){
			console.log(data);

			$("#panel-body").append(data);

		});


		$("#profileForm").on('submit', function(e){

			e.preventDefault();

		});

		/*
		$("#dialog").dialog({
			show:{
				effect : 'slide',
				complete: function(){
					console.log("animia complete..");
				}
			},
			open: function(event, ui){

				//정보 입력후 아이디 설정 못하도록 막기
				$("#dg_name").val(userInfo.name);
				$("#dg_address").val(userInfo.address);
				$("#dg_interestedPart").val(userInfo.interestedPart);
				$("#dg_weakPart").val(userInfo.weakPart);
				$("#dg_strongPart").val(userInfo.strongPart);
				$("#dg_bodyType").val(userInfo.bodyType);

				$("#btnAddFriend").html("수정하기");
				$("#btnMakeChat").html("초기화");
				$("#btnBlock").html("취소하기")


				$("#profileForm").on('submit', function(e){

					e.preventDefault();

				});

			}
		});*/
	});

	tabOtherFriend.on('click', function()
	{
		removeAppendElement();

		$("#dialogFriendConf").fadeIn(1200);

		var filter = userInfo.filter;
		$("#dg_conf_bodyType").val(filter.f_bodyType);
		$("#dg_conf_address").val(filter.f_address);


		$("#friendConfForm").on('submit', function(e){

			e.preventDefault();

			applyFriendConfiguration();

		});

		/*
		$("#dialogFriendConf").dialog({
			show:{
				effect : 'slide',
				complete: function(){
					console.log("animia complete..");
				}
			},
			open: function(event, ui){


				var filter = userInfo.filter;
				$("#dg_conf_bodyType").val(filter.f_bodyType);
				$("#dg_conf_address").val(filter.f_address);


				$("#friendConfForm").on('submit', function(e){

					e.preventDefault();

					applyFriendConfiguration();

				});

			}
		});*/
	});

	tabOtherSchedule.on('click', function () {

		removeAppendElement();

		$.post('/main/schedule', function(data){
			console.log(data);

			$("#panel-body").append(data);

		});
	});



	tabFriend.on('click', function (e){

		$(".tablinks").each(function(){
			//console.log($(this).html() + "\n");
			$(this).parent().removeClass("active");
		});
		$(".panel-body  .panel").each(function(){
			$(this).css('display', 'none');
		});

		$("#tcFriend").css('display', 'block');
		$(this).parent().addClass("active");

		//서버에 친구 정보를 요청한다.

		$.post('/main/friendRequest', function(data){
			console.log(data);
			var result = data.result;

			//console.log("friendRequest : ")

			//소켓으로 해당 아이디들이 존재 하는지 체크 한다.
			socket.emit('friendStatusRequest', {data : result});

			socket.on('friendStatusResponse', function(data){
				//테이블 업데이트 하기..
				createFriendList(data.result);
			});


		});


	});

	function removeAppendElement()
	{
		$(".panel-body  .panel").each(function(){
			$(this).css('display', 'none');
		});
		$("#mainProfile").remove();
		$("#mainSchedule").remove();
	}


	$("#btnRequest").on('click', function(e){

		e.preventDefault();     //서브밋 액션을 취소 시킨다.
		/*        $.post('/main/request', function(data){
		 console.log(data);
		 userInfo = data.result;
		 initSocket(data.result);
		 });*/
		//$(location).attr('href', '/main/test');
		$(location).attr('href', '/main/profile');
	});



	btnAddFriend.on('click', function (e){

		//친구 추가하기
		var username = userInfo.username;
		var friendname = $("#dg_username").val();

		console.log("BtnAdd click... username : " + username + ", friendname : " + friendname);

		//서버에 요청한다.
		//2. post로 보내서
		$.post('/main/friendAdd', {params: {username: username, friendname:friendname}})
			.success(
				function (success) {
					//console.log(success)
					console.log("result : " + success)

				})
			.error(
				function (error) {
					console.log(error)
				});
	});

	//프로필 다이얼로그 버튼 초기화 //
	btnMatChat.on('click', function (e) {

		//채팅 시작 하기
		var roomId = Math.round((Math.random() * 1000000));

		console.log("clientId : " + clientId + ", roomId : " + roomId);

		socket.emit("chatwith", {clientId : clientId, roomId : roomId});

		//close 되고 채팅 화면으로 이동한다.
		$("#dialog").dialog('close');
		//채팅 다이얼로그 띄운다..
		//openChatDialog();
		openChatDiv();
	});

	/**
	 *  대화목록을 클릭하여 대화내용을 가져온다.
	 */
	function openChatDivFromChatStatus(targetname)
	{
		//msg List를 받아온다.\
		var username = userInfo.username;
		var targetname = targetname;
		$.post('/main/chat/requestChatContent', {params: {username: username, targetname: targetname}})
			.success(
				function (success) {
					//console.log(success)
					console.log("result : " + success)
					//대화 목록을 생성한다.
					createChatContent(success);
				})
			.error(
				function (error) {
					console.log(error)
				});
	}
	/**
	 *  채팅창을 DIV로 띄운다.
	 */
	function openChatDiv()
	{
		//Panel 모두 숨긴다.
		removeAppendElement();

		$("#dialogChat").fadeIn(1200);
		g_chats = $("#chats");
		//$("#chats").empty();
		g_chats.empty();

		chatForm.on('submit', function(e){

			e.preventDefault();
			name = userInfo.username;

			if(textarea.val().trim().length) {
				createChatMessage(textarea.val(), name, moment());
				scrollToBottom("To");

				// Send the message to the other person in the chat
				socket.emit('msg', {msg: textarea.val(), user: name});
			}
			// Empty the textarea
			textarea.val("");
		});
	}

	/**
	 *  채팅창을 다이얼로그로 띄운다.
	 */
	function openChatDialog()
	{
		$("#dialogChat").dialog({
			show:{
				effect : 'slide',
				complete: function(){
					console.log("animia complete..");
				}
			},
			open: function(event, ui){
				console.log("dialog open..");

				chatScreen.css('display','block');

				footer.fadeIn(1200);
				chatForm.on('submit', function(e){

					e.preventDefault();
					name = userInfo.username;

					if(textarea.val().trim().length) {
						createChatMessage(textarea.val(), name, moment());
						scrollToBottom();

						// Send the message to the other person in the chat
						socket.emit('msg', {msg: textarea.val(), user: name});
					}
					// Empty the textarea
					textarea.val("");
				});
			}
		});
	}

	/**
	 *  채팅 요청시 상대방에 DIV로 띄운다.
	 */
	function openChatDivFromChat(data)
	{
		//Panel 모두 숨긴다.
		$(".panel-body .panel").each(function(){
			$(this).css('display', 'none');
		});
		//Chat From 숨긴다.
		tabChatFrom.css('display', 'none');

		//대화 응답 창을 연다.
		//채팅 연결 문자 입력
		var p =
			"<p> 상대방과 대화가 연결되었습니다. </p>";
		$("#dialogChatFromChat .chatscreen").prepend(p);
		//대화 창을 모두 삭제한다.

		//chatFomFromChat.find('.chats').remove();
		g_chats = $("#fromChats");
		g_chats.empty();

		$("#dialogChatFromChat").fadeIn(1200);

		socket.emit("chatok", {roomId : data.fromRoomId, targetId : data.fromSocket});
		//대화가 연결되었음을 알린다. 그이후로는.. 상대방과 통신하게 된다..
		chatFomFromChat.on('submit', function(e){

			e.preventDefault();

			name = userInfo.username;
			if(textareaFromChat.val().trim().length) {
				createChatMessage(textareaFromChat.val(), name, moment());
				scrollToBottom("From");
				// Send the message to the other person in the chat
				socket.emit('msg', {msg: textareaFromChat.val(), user: name});
			}
			textareaFromChat.val("");
		});
	}

	/**
	 * 채팅 요청시 상대방에 다이얼로그를 띄운다.
	 */
	function openChatDialogFromChat()
	{
		$("#dialogChat").dialog({
			show: {
				effect: 'slide',
				complete: function () {
					console.log("animia complete..");
				}
			},
			open: function (event, ui) {
				console.log("dialog open..");

				chatScreen.css('display', 'block');

				footer.fadeIn(1200);
				socket.emit("chatok", {roomId : data.fromRoomId, targetId : data.fromSocket});
				//대화가 연결되었음을 알린다. 그이후로는.. 상대방과 통신하게 된다..

				chatForm.on('submit', function(e){

					e.preventDefault();

					// Create a new chat message and display it directly

					//showMessage("chatStarted");

					name = userInfo.username;

					if(textarea.val().trim().length) {
						createChatMessage(textarea.val(), name, moment());
						scrollToBottom("From");

						// Send the message to the other person in the chat
						socket.emit('msg', {msg: textarea.val(), user: name});

					}
					// Empty the textarea
					textarea.val("");
				});
			}
		});
	}

	btnBlock.on('click', function (e){

		//상대방 막기
	});

	/**
	 * 대확 목록에 데이터를 이용하여 테이블을 생성한다.
	 * @param data
	 */
	function createChatList(data)
	{
		console.log("crateChatList is calle.");
		tblChatStatus.find('tbody').empty();
		var result = data.result;
		for(var i in result)
		{
			/*           var tr = "<tr  data-rel='popup'>" +
			 " <td> " + i + " </td>" +
			 "<td>" + "<img src='../images/unnamed.jpg' width='20%' height='20%'> " + "</td>" +
			 "<td>" + "내용입니다" + "</td>" +
			 "<td>" + data[i].date + "</td>" +
			 "<td>" + "-"   + "</td>" +
			 "</tr>";

			 tblChatStatus.append(tr);*/

			//Element로 tr 추가하기.

			//key 값을 추출하자..
			for(var key in result[i]) {
				console.log("key .. : " + key);
				var withName = key;
				var msgGroup = result[i];
				var msgList = msgGroup[withName].msg;     //Array


				var td =
					" <td> " + i + " </td>" +
					"<td>" + "<img src='../images/unnamed.jpg' width='20%' height='20%'> " + "</td>" +
					"<td>" + "내용입니다" + "</td>" +
					"<td>" + msgGroup.date + "</td>" +
					"<td>" + withName + "</td>";

				console.log("msgList : " + msgList);

				$("<tr>", {
					click: function () {
						// console.log("Ma ! clicked..msgList : " + msgList);
						// console.log("idx : " + $(this).find('td').eq(4).html());
						var targetname = $(this).find('td').eq(4).html();
						//openChatDivWithMsgList(msgList);
						openChatDivFromChatStatus(targetname);
					}
				}).append(td).appendTo(tblChatStatus);


				$('tr').not(':first').hover(
					function () {
						$(this).css("background", "yellow");
					},
					function () {
						$(this).css("background", "");
					}
				);

				//이벤트 생성하기..
				//행 클릭 시 이벤트 연결++
				/*            tblChatStatus.find('tr').click(function (e) {
				 //대화창을 연다.
				 openChatDiv();
				 });*/
			}
		}
	}

	/**
	 *  대화를 서버로 부터 가져온다.
	 * @param data
	 */
	function createChatContent(data)
	{
		console.log("crateChatList is calle.");
		tblChatStatus.find('tbody').empty();
		var result = data.result;
		for(var i in result)
		{
			/*           var tr = "<tr  data-rel='popup'>" +
			 " <td> " + i + " </td>" +
			 "<td>" + "<img src='../images/unnamed.jpg' width='20%' height='20%'> " + "</td>" +
			 "<td>" + "내용입니다" + "</td>" +
			 "<td>" + data[i].date + "</td>" +
			 "<td>" + "-"   + "</td>" +
			 "</tr>";

			 tblChatStatus.append(tr);*/

			//Element로 tr 추가하기.

			//key 값을 추출하자..
			for(var key in result[i]) {
				console.log("key .. : " + key);
				var withName = key;
				var msgGroup = result[i];
				var msgList = msgGroup[withName].msg;     //Array


				var td =
					" <td> " + i + " </td>" +
					"<td>" + "<img src='../images/unnamed.jpg' width='20%' height='20%'> " + "</td>" +
					"<td>" + "내용입니다" + "</td>" +
					"<td>" + msgGroup.date + "</td>" +
					"<td>" + withName + "</td>";

				console.log("msgList : " + msgList);

				$("<tr>", {
					click: function () {
						// console.log("Ma ! clicked..msgList : " + msgList);
						// console.log("idx : " + $(this).find('td').eq(4).html());
						var targetname = $(this).find('td').eq(4).html();
						//openChatDivWithMsgList(msgList);
						openChatDivFromChatStatus(targetname);
					}
				}).append(td).appendTo(tblChatStatus);


				$('tr').not(':first').hover(
					function () {
						$(this).css("background", "yellow");
					},
					function () {
						$(this).css("background", "");
					}
				);

				//이벤트 생성하기..
				//행 클릭 시 이벤트 연결++
				/*            tblChatStatus.find('tr').click(function (e) {
				 //대화창을 연다.
				 openChatDiv();
				 });*/
			}
		}
	}

	/**
	 * 친구 목록 클릭시 친구 프로필 보기
	 * @param data
	 */
	function createFriendList(data)
	{

		tblFriend.find('tbody').empty();
		for(var i in data)
		{
			var tr = createFriendTablTrHtml(i, data);

			tblFriend.append(tr);

			$('tr').not(':first').hover(
				function(){
					$(this).css("background", "yellow");
				},
				function(){
					$(this).css("background", "");
				}
			);
		}

		//행 클릭 시 이벤트 연결
		$("#tblFriend tbody tr").click(function (e) {

			//서버에 나타나 있는 사람에 대하여 친구를 추가한다..
			$("#dialog").dialog({
				show: {
					effect: 'slide',
					complete: function () {
					}
				},
				open: function (event, ui) {
					//해당 아이디가 현재 자신의 친구와 같은지 판단한다..
					/*
					 profileForm.on('click', function(e){

					 e.preventDefault();
					 var username = userInfo.username;
					 var friendname = $("#dg_username").val();
					 addFriend(uesrname, friendname);
					 });*/
				}
			});


		});
	}

	function createFriendTablTrHtml(i, data)
	{
		var tr = "<tr  data-rel='popup'>" +
			" <td> " + i + " </td>" +
			"<td>" + data[i].name + "</td>" +
			"<td>" + data[i].status + "</td>" +
			"<td>" + "-"   + "</td>" +
			"</tr>";

		return tr;
	}

	//필터 수정
	function applyFriendConfiguration()
	{
		//1. 설정 정보 확인
		var filter = userInfo.filter;
		console.log("filter.. " + filter);

		//1.1 필터 정보 현시
		var username = userInfo.username;


		//2. post로 보내서
		$.post('/main/conf/connectedClient', {params: {username: username, address : $("#dg_conf_address").val(), bodyType : $("#dg_conf_bodyType").val()}})
			.success(
				function (success) {
					//console.log(success)
					console.log("result : " + success)
					// $(location).attr('href', '/main');
				})
			.error(
				function (error) {
					console.log(error)
				});


		//3. user.json 파일 설정
	}

	//친구 추가하기
	function addFriend(username, friendname)
	{
		//btnAddFriend
		//post..
		//먼저 추가하려고 하는 아이디가 현재 등록되어 있는지 확인한다..(나중에)

		//2. post로 보내서
		$.post('/main/friendAdd', {params: {username: username, friendname: friendname}})
			.success(
				function (success) {
					//console.log(success)
					console.log("result : " + success)

				})
			.error(
				function (error) {
					console.log(error)
				});
	}


	function createChatMessage(msg,user,now){

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


		//uiChats.append(li);
		g_chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(type){
		/*$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);*/
		if(type === "To")
			$("#dialogChat .chatscreen").animate({ scrollTop: $("#dialogChat .chats").height()-$("#dialogChat .chatscreen").height() + 100 },1000);
		else
			$("#dialogChatFromChat .chatscreen").animate({ scrollTop: $("#dialogChatFromChat .chats").height()-$("#dialogChatFromChat .chatscreen").height() + 100 },1000);
	}


	//서버에 접속자 정보를 요청한다.
	$.post('/main/request', function(data){
		console.log(data);
		userInfo = data.result;
		initSocket(data.result);
	});



	function initSocket(result) {
		// on connection to server get the id of person's room
		socket = io();

		socket.on('connect', function () {
			//서버에 연결이 성공적일때, load  시그널을 보낸다.
			console.log("connected..to server..");
			socket.emit('load', {result : userInfo});


		});


		//서버로 부터 OK 메시지 수신..
		socket.on('chatok', function (data) {

			chatScreen.find('p').remove();
			console.log("chatok roomId : " + data.roomId)
			var p =
				"<p> 상대방과 대화가 연결되었습니다. </p>";
			chatScreen.prepend(p);

			//showMessage("chatStarted");
		});

		socket.on('receive', function(data){

			//showMessage('chatStarted');

			if(data.msg.trim().length) {
				createChatMessage(data.msg, data.user, moment());
				scrollToBottom("From");
			}
		});

		//로그인이 되엇을 경우..
		//현재 서버에 접속한 사람 수 보여주기..
		socket.on('peopleinserver', function (data) {

			console.log("[client] receive : " + data.connectedClient);

			showMessage("personinserver", data.connectedClient);

			// Update the relative time stamps on the chat messages every minute

			setInterval(function () {

				// 60초 간격으로 전송한다..

			}, 60000);
		});

		//서버로 부터 메시지를 수신 초대
		//만약 하면 새로운 창을 띄운다.?
		socket.on('chatfrom', function (data) {

			console.log("chatfrom : " + data.chatfrom);

			showMessage("chatfrom", data.chatfrom);
		});

		//서버로 부터 leave 메시지 수신..
		socket.on('leave',function(data) {

			if (data.boolean && id == data.room) {

				showMessage("somebodyLeft", data);
				chats.empty();
			}
		});

		/*

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
		 */
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
		else if(status === "personinserver") {

			tabLogin.css("display", "none");
			tcConnStatus.fadeIn(1200);

			tblConnStatus.find('tbody').empty();

			//data 객체를 풀어서 현시한다..
			for(var i in data)
			{
				var tr = "<tr  data-rel='popup'> <td> " + i + " </td>" +
					"<td>" + data[i].name + "</td>" +
					"<td>" + data[i].address + "</td>" +
					"<td>" + data[i].interestedPart   + "</td>" +
					"<td>" + data[i].clientId + "</td>" +
					"<td>" + data[i].username + "</td>"
				"</tr>";

				tblConnStatus.find('tbody').append(tr);

				$("tr").not(':first').hover(
					function(){
						$(this).css("background", "yellow");
					},
					function(){
						$(this).css("background", "");
					}
				);
			}

			//행 클릭 시 이벤트 연결
			$("#tblConnStatus tbody tr").click(function (e){

				// console.log($(this).find("p").text() + ", id : " + $(this).find("td").eq(4).html());

				//정보 입력하기..


				clientId = $(this).find('td').eq(4).html();
				$("#dialog").dialog();

				dg_name.val($(this).find("td").eq(1).html());
				dg_address.val($(this).find("td").eq(2).html());
				dg_interestedPart.val($(this).find("td").eq(3).html());
				dg_username.val($(this).find("td").eq(5).html());

				console.log("dg_name : " + dg_name.val() + ", client id : " + clientId);

				// window.location.href = $(this).find("a").attr("href");
				//v프로파일을 띄운다.
				//우선 ID를 요청하여 전체 정보를 가져온다??
				/*                $.post( "ajax/test.html", function( data ) {
				 $( ".result" ).html( data );
				 });*/
				//팝업을 띄우자..




				/*

				 var clientId = $(this).find("td").eq(4).html()

				 var roomId = Math.round((Math.random() * 1000000));

				 console.log("clientId : " + clientId + ", roomId : " + roomId);

				 socket.emit("chatwith", {clientId : clientId, roomId : roomId});*/

			});

			$("#btnRefresh").click(function () {
				console.log("Refresh button clicked..");
				socket.emit("refresh");
			});
		}

		else if(status === "chatfrom") {
			//쪽지를 보낸 상대방을 보여준다..
			// personInserver.css("display", "none");
			//  $(".chatfrom").fadeIn(1200);

			tabChatFrom.fadeIn(1200);

			console.log("fromname : " + data.fromName);

			//화면에 말을 걸어온 사람을 보여준다.
			$("#fromName").val(data.fromName);
			$("#fromAddress").val(data.fromAddress);
			$("#fromPart").val(data.fromInterestedPart);
			//ok
			$("#btnChatFromOk").click(function () {

				//두 사람간의 1:1 대화 연결결
				//var newWindow = window.open("./chatScr:"+"test", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
				//채팅 다이얼로그 띄운다..
				//openChatDialogFromChat();
				//div로 띄운다..
				openChatDivFromChat(data);


			});

			//cancel
			$("#btnChatFromCancel").click(function (){

			});

		}else if(status === "somebodyLeft"){

			/*leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);*/
			//대화 내용을 저장한다..
		}
	}
})
