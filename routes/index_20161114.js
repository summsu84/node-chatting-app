// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');

// Export a function, so that we can pass
// the app and io instances from the app.js file:

//최초 요청시 home을 보여준다..
module.exports = function(app,io){

  app.get('/', function(req, res){

    // Render views/home.html
    res.render('home');
  });

  //chat2

  app.get('/chat2', function(req,res){

    res.render('chat2');
  });

  //create url에 대해서 랜덤 숫자 생성하고 채팅방 생성한다.
  app.get('/create', function(req,res){

    // Generate unique id for the room
    var id = Math.round((Math.random() * 1000000));

    // Redirect to the random room
    res.redirect('/chat/'+id);
  });

  //채팅방을 보여준다.
  app.get('/chat/:id', function(req,res){

    // Render the chant.html view
    res.render('login');
  });

  //커넥션 관리
  var connectionList = {};


  // Initialize a new socket.io application, named 'chat'
  // 아래부터 소켓 연결 이후 자바스크립트..
  var chat = io.on('connection', function (socket) {

    // When the client emits the 'load' event, reply with the
    // number of people in this chat room

    //클라이언트로 부터 'load' 수신
    socket.on('load',function(data){
      //전체 컨넥션 수를 알려주고, 접속자를 알려주도록 하자..
      var clients = io.sockets.connected;
      console.log("client : " + clients);
      var connectedIds = Object.keys(clients);
      var connectedCount = connectedIds.length;
      console.log("client : " + clients + ", count : " + connectedCount);

      socket.emit('peopleinchat', {number: connectedCount});
    });

    // 클라이언트로 부터 'login' 수신 시
    socket.on('login', function(data) {

      console.log("[server] on login - data name : " + data.user + " , address : " + data.address + ", interestedpart : " + data.interestedpart);

      //소켓에 사용자 등록하기...
      socket.username = data.user;
      socket.useraddress = "강남구";
      socket.userinterestedpart = data.interestedpart;

      //연결된 클라이언트 정보르 ㄹ가져온다..
      var connectedClient = getConnectedClient(io, socket);

      if(connectedClient.length > 0)
      {
        socket.emit('peopleinserver', {connectedClient: connectedClient});
      }else{
        socket.emit('peopleinserver', {connectedClient: 0});
      }

    });

    //서버에 접속한 사람들에 대한 정보를 다시 요청한다.
    socket.on('refresh', function(data) {
      var connectedClient = getConnectedClient(io, socket);

      if(connectedClient.length > 0)
      {
        socket.emit('peopleinserver', {connectedClient: connectedClient});
      }else{
        socket.emit('peopleinserver', {connectedClient: 0});
      }
    });

    //상대방에게 대화 시작전 메시지
    socket.on('chatwith', function(data) {

      //find client socket..
      console.log("[Server] on chatwith - data.client id : " + data.clientId + ", roomId : " + data.roomId);
      //상대방 소켓 아이디로 요청한다..
      var targetsocket = getClient(io, data.clientId);

      var roomId = data.roomId;

      var retVal = {fromUser : socket.username,
                    fromAddress:socket.useraddress,
                    fromPart:socket.userinterestedpart,
                    fromSocket:socket.id,
                    fromRoomId : roomId};
      //방을 만든다..
      socket.join(roomId);
      socket.room = roomId;

      //상대방 소켓에 'chatfrom' 시그널을 보낸다.
      targetsocket.emit('chatfrom', {chatfrom : retVal});
    });

    //상대방에서 OK 버튼 클릭시 두사람간의 대화가 이루어진다..
    socket.on('chatok', function(data){
      // Add the client to the room (room으로 접속)
      console.log("[server] on chatok data-roomId : " + data.roomId);   //roomId 는 요청자에 의해서 생성된다..

      socket.join(data.roomId);

      socket.room = data.roomId;
      //상대방에게 알려준다. 연결된것을.
      //console.log("[Server] on chatwith - data.client id : " + data.clientId);
      var targetsocket = getClient(io, data.targetId);

      targetsocket.emit('chatok', {roomId : data.roomId});
    });
    // Somebody left the chat
    socket.on('disconnect', function() {

      // Notify the other person in the chat room
      // that his partner has left

      socket.broadcast.to(this.room).emit('leave', {
        boolean: true,
        room: this.room,
        user: this.username,
        avatar: this.avatar
      });

      // leave the room
      socket.leave(socket.room);
    });


    // Handle the sending of messages
    socket.on('msg', function(data){

      console.log("[server] on msg - data.msg : " + data.msg + ", socket room : " + socket.room);
      // When the server receives a message, it sends it to the other person in the room.
      socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
    });

  });
};

/**
 * 특정 아이디를 가진 소켓 정보를 가져온다.
 * @param io
 * @param clientId
 * @returns {*}
 */
function getClient(io, clientId)
{
  var clients = io.sockets.connected;
  //io.sockets.connected.id를 하면 가져 오겠네..?

  var clientSocket = clients[clientId];

  return clientSocket;
}

/**
 * 서버에 연결된 소켓 정보들을 가져온다.. 단, socket(접속 클라이언트) 는 제외한다.
 * @param io
 * @param socket
 * @returns {Array}
 */
function getConnectedClient(io, socket)
{
  var clients = io.sockets.connected;
  //요청 하는 socket key는 제거 한다..
  //delete clients[socket.id];

  var connectedIds = Object.keys(clients);      //클라이언트 들의 소켓 아이디를 검색한다..
  var connectedCount = connectedIds.length;

  // 서버에 접속한 클라이언트를 계산한다.
  var array = new Array();
  if(connectedCount > 0) {

    for (var i in connectedIds) {
      if(connectedIds[i] === socket.id) continue;
      var obj = new Object();
      obj.name = clients[connectedIds[i]].username;
      obj.address = clients[connectedIds[i]].useraddress;
      obj.part = clients[connectedIds[i]].userinterestedpart;
      obj.clientId = connectedIds[i];
      //array[i] = obj;
      array.push(obj);

    }
  }

  return array;
}

//클라이언트 소켓 검색..
function findClientsSocket(io,roomId, namespace) {

  var res = [],
      ns = io.of(namespace ||"/");    // the default namespace is "/"

  if (ns) {
    for (var id in ns.connected) {

      if(roomId) {
              //var index = ns.connected[id].rooms.id.indexOf(roomId) ;
        //index 찾기 roomId가 있으면.. res에 집어 넣는다..
        var index;
        if(ns.connected[id].hasOwnProperty('room')) {
         // index =  ns.connected[id].room.indexOf(roomId) ;
          if(ns.connected[id].room == roomId)
          {
            index = 1;
          }else {
            index = -1;
          }

        }else {
          index = -1;

        }

        //방이 없다..
        if(index !== -1) {

          res.push(ns.connected[id]);
        }
      }
      //방이 존재 하지 않는다.
      else {

        res.push(ns.connected[id]);
      }
    }
  }
  return res;
}
