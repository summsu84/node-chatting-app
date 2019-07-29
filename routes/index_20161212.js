// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');

// Export a function, so that we can pass
// the app and io instances from the app.js file:

var testUserArray = new Array();

//최초 요청시 home을 보여준다..
module.exports = function(app,io, fs,db){

  var mongoose = require('mongoose');
  var db;

  mongoose.connect('mongodb://localhost/mongodb_demo', function(err){
    if(err){
      console.log(err);
      return;
    }else{
      console.log("Connected to mongodb");

    }
  });

  db = mongoose.connection;              //연결된 MongoDB의 인스턴스를 가져오고 이를 DB에 입력한다.

  var userSchema = mongoose.Schema({
    userId: String,
    password: String,
    name: String,
    city: String,
    gu: String,
    interestedPart: String,
    bodyType: String,
    weakPart: String,
    strongPart: String,
    crated: {type : Date, default:Date.now},
    online: Boolean,
    lastConnected:{type : Date, default:Date.now}
  });

  var User = mongoose.model('user', userSchema);

  /** 로그인 프로세서 **/
  login_post = function(req, res)
  {

    res.status(200);
    var userId = req.username;
    var password = req.password;
    var userCollection = db.collection('user');

    //Check user from MongoDB
    userCollection.findOne({userId: userId, password: password}, function (err, user){
      console.log("user : " + user);
      var result = {};
      if(user != null)
      {
        //session registration
        req.session.login = "login";
        req.session.userId = userId;
        //db에 접속한 시간과 상태를 업데이트 한다.
        userCollection.update({userId: userId}, {$set:{online:true, lastConnected:new Date()}}, function(err){

          if(err)
            console.log("update failed..");
          else
            console.log("update success");
        });

        result["sucess"] = 1;
      }else {
        console.log("user is not found");
        result["sucess"] = 0;
      }
      res.status(200);
      res.json(result)
      //res.json(result);
    });
  }



  //main
  app.get('/', function(req, res){



    console.log("[server] main..");
    // Render views/main.html
    res.render('mMain');
  });

  app.get('/code', function(req, res){

    // Render views/main.html
    res.render('mMain');
  });

  app.post('/login2', function (req, res, next){

    /** body parser를 사용하기 위해 form 의 태그에 name 값 속성을 지정해줘야 하나.. **/
      //Express-session initialization
    console.log("[server] login2");

    req.username = req.body.params.username;
    req.password = req.body.params.password;
    next();

  }, login_post);

  app.get('/main/signupForm', function (req, res) {

    res.sendFile('mSignup.html', {root:__dirname + "/../views/"});
  });

  //회원 가입하기
  app.post('/main/signup', function(req, res)
  {
    //정보를 파싱하여 파일에 저장한다.
    var username = req.body.params.username;
    var name = req.body.params.name;
    var password = req.body.params.password;
    var address = req.body.params.address;
    var interestedPart = req.body.params.interestedPart;
    var bodyType = req.body.params.bodyType;
    var strongPart = req.body.params.strongPart;
    var weakPart = req.body.params.weakPart;

    console.log("[server] signup - username : " + username + ", password : " + password + ", address : " + address + ", interestedPart : " + interestedPart);

    //파일에 기록한다..

    //객체 생성하기..
    var obj = { };

    // 갑저장하는 객체 생성하기
    var userObj = {password : password, name : name, address : address, interestedPart : interestedPart, bodyType : bodyType, weakPart : weakPart, strongPart : strongPart, filter : [], friend : []};

    //동적으로 username 필드를 만들고 거기에 userObj를 대입한다.
    obj[username] = userObj;

    //obj[username].push({password : password, name : name, address : address, interestedPart : interestedPart, bodyType : bodyType, weakPart : weakPart, strongPart : strongPart, filter : [], friend : []});

    //3. convert it to a json
    var json = JSON.stringify(obj);

    //4. append..
      fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
        if(err){
          console.log(err);
        }else{
          obj = JSON.parse(data);
          obj[username] = userObj;
          json = JSON.stringify(obj);
          fs.writeFile(__dirname + "/../data/user.json", json, 'utf8', function(err, data){

          });
        }
    });
  });

  //접속한 유저 필터 정보를 수정한다.
  app.post('/main/conf/connectedClient', function(req, res){

    //1. 정보 가져오기 html로 부터
    //정보를 파싱하여 파일에 저장한다.
    var username = req.body.params.username;
    var address = req.body.params.address;
    var bodyType = req.body.params.bodyType;
    console.log("/main/conf/connectedClient.. username : " + username + ", address : " + address + ", bodyType : " + bodyType);

    //파일 수정하기..
    //1. 파일을 읽어 들인다.
    fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){

      //data를 읽어 들인다.
      var fileObj = JSON.parse(data);
      //값을 수정한다.
      var newFilterObj = {};
      newFilterObj.f_address = address;
      newFilterObj.f_bodyType = bodyType;

      fileObj[username]["filter"] = newFilterObj;

      var json = JSON.stringify(fileObj);

      //다시 json 포맷으로 파일을 저장한다.
      fs.writeFile(__dirname + "/../data/user.json", json, 'utf8', function(err, data) {
        if(err) throw err;

      });
    })


  });



  //로그인 성공시 유저 정보 등록 (일단은..이런형식으로 하자..)
  app.get('/login/:username/:password', function(req, res){

    //Express-session initialization
    console.log("[server] login");
    var sess;
    sess = req.session;

    fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
      var users = JSON.parse(data);
      var username = req.params.username;
      var password = req.params.password;
      console.log("username : " + username + ", password : " + password);
      var result = {};
      if(!users[username]){
        // USERNAME NOT FOUND
        result["success"] = 0;
        result["error"] = "not found";
        //res.json(result);
        res.redirect('/');
        return;
      }

      if(users[username]["password"] == password){
        result["success"] = 1;
        sess.username = username;
        sess.name = users[username]["name"];
        //res.json(result);
        res.redirect('/main');

      }else{
        result["success"] = 0;
        result["error"] = "incorrect";
        //res.json(result);
        res.redirect('/');

      }
    })
  });

  //main---------------Main--------------
  app.get('/main', function(req, res){

    //메인은 현재 접속자 현황을 보여준다.
    res.render('mMain', {myVar : "test"});

  });

  //main
  app.get('/main/status/chat', function(req, res){

    //메인은 현재 접속자 현황을 보여준다.
    //res.render('codes', {myVar : "test"});
    res.sendFile('codes.html', {root:__dirname + "/../views/"});


  });

  //test
  app.get('/main/test', function(req, res){

    //메인은 현재 접속자 현황을 보여준다.
    //res.render('codes', {myVar : "test"});
    res.sendFile('test1.html', {root:__dirname + "/../views/"});


  });
  //test
  app.post('/main/test2', function(req, res){

    //메인은 현재 접속자 현황을 보여준다.
    //res.render('codes', {myVar : "test"});
    res.sendFile('test2.html', {root:__dirname + "/../views/"});


  });


  //pfoiel


  //대화 관련
  //1. 대화 목록창을 가져온다.
  app.post('/main/chat/request', function(req, res){

    //UserChat.json 파일에서 누구와 대화를 했는지 가져온다.
    var username = req.body.params.username;
    console.log("[server] main/chat/request... username : " + username);
    //채팅 내역을 확인한다.
    // fs.readFile(__dirname + "/../data/userChat.json", "utf8", function(err, data) {
    var filePath = "/../data/userChat_" + username + ".json"
    fs.readFile(__dirname + filePath, "utf8", function(err, data) {
      if (err) {
        console.log(err);
      } else {
        var obj = JSON.parse(data);

        var chatList = obj[username];

        res.json({result : chatList});
      }
    });
  });

  //2. 대화의 상세 정보를 가져온다.
  app.post('/main/chat/requestChatContent', function(req, res){
    var username = req.body.params.username;
    var targetname = req.body.params.targetname;
    console.log("[server] main/chat/request... username : " + username + ", targetname : " + targetname);
    //채팅 내역을 확인한다.
    fs.readFile(__dirname + "/../data/userChat.json", "utf8", function(err, data) {
      if (err) {
        console.log(err);
      } else {

        var obj = JSON.parse(data);
        var chatList = obj[username][targetname];

        res.json({result : chatList});
      }
    });

  });


  //2. 대화 목록창에서 특정 대화를 클릭했을때, 해당 대화 내용들을 가져온다.
  app.post('/main/chat/requestDetail', function(req, res){


  });

  //3. 대화 목록창을 삭제 한다.
  app.post('/main/chat/delete', function(req, res){


  });



  //프로파일을 업데이트 한다.
  app.post('/main/profile/update', function(req, res){
    var session = req.session;
    var result = {username : session.username,
      name : session.name,
      address : session.address,
      interestedPart : session.interestedPart,
      bodyType :session.bodyType,
      weakPart : session.weakPart,
      strongPart :session.strongPart
    };

    res.json({result: result});
  });


  //접속 정보를 초기화 한다.
  app.post('/main/requestInit', function(req, res) {
    var session = req.session;
    var result = {username : session.username,
        name : session.name,
        address : session.address,
        interestedPart : session.interestedPart,
        bodyType :session.bodyType,
        weakPart : session.weakPart,
        strongPart :session.strongPart,
        filter:session.filter
    };


    res.json({result: result});
  });



  //채팅방을 보여준다.
  app.get('/chatScr:userName', function(req,res){

    //parameter
    var uName = req.params.userName;

    console.log("[app get] uName : " + uName);

    // Render the chant.html view
    res.render('chatScr', {username : uName});
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


  //설정
  //1. 프로필 설정
/*  app.get('/main/profile', function(req, res){
    //ejs로 해야하나...

    res.render('mainProfile');
  });*/
  app.post('/main/profile', function(req, res){
    //ejs로 해야하나...

    res.sendFile('mainProfile.html', {root:__dirname + "/../views/"});
  });

  //profile 정보 요청
  app.post('/main/profile/request', function(req, res){
    //ejs로 해야하나...

    res.render('mainProfile');
  });

  //친구 정보 요청
  app.post('/main/friendRequest', function(req, res){

    //1. 세션에서 사용자 정보를 가져온다.
    var username1 = req.session.username;
    //소켓 정보를 가져오자..
    //var result = getClientFriend(username, fs)

    //console.log("getClientFriend usernmae : " + username1);
    fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data) {
      var users = JSON.parse(data);
      var userFriend;
      //클라이언트로부터 값을 받아온다..
      var username = req.session.username;

      console.log("[server] friendrequest - requestusername : " + username);

      var result = {};
      if (!users[username]) {
        // USERNAME NOT FOUND
        result["success"] = 0;
        result["error"] = "not found";

        //res.redirect('/');
        return;
      }

      //친구 정보를 등록한다.
      userFriend = users[username]["friend"];
      res.json({result: userFriend});
    });
  });

  //친구 추가하기

  // app.post('/main/friendAdd', function(req, res){
  app.put('/main/friendAdd/:username', function(req, res){

    //지정한 아이디를 친구 추가한다.
    var result = {};
    var username = req.params.username;     //해당 방법은 url에서 가져오는 방법
    var friendname = req.body.friendname;   //해당 방법은 ajax 데이터에서 가져오는 방법..

    //3. convert it to a json

    console.log("[server] main/friendAdd... username : " + username + ", friendname : " + friendname)

    fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);

        var friend = obj[username]["friend"];
        //friend리스트에 중복확인한다.
        for(var i in friend)
        {
          var tmp = friend[i];
          if(tmp.name === friendname)
          {
            console.log("friend duplication!");
            result["success"] = 0;
            result["error"] = "FriendName is duplicatated";
            res.json(result);
            //res.redirect('/');
            return;
          }
        }
        var newfriend = {name : friendname};

        friend.push(newfriend);

        obj[username]["friend"] = friend;

        json = JSON.stringify(obj);
        fs.writeFile(__dirname + "/../data/user.json", json, 'utf8', function(err, data){
          if (err) {
            console.log("error!!!");
            throw err;
          }
          result["success"] = "Friend Adding is Success";
          result["error"] = 0;
          res.json(result);
        });
      }
    });
  });

  //친구 삭제 하기
  app.post('/main/friendDel', function (req, res){
    // 지정한 아이디로 친구 삭제한다.
    //지정한 아이디를 친구 추가한다.
    var username = req.body.params.username;
    var friendname = req.body.params.friendname;
    //3. convert it to a json

    console.log("[server] main/friendAdd... username : " + username + ", friendname : " + friendname)

    fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);

        var friend = obj[username]["friend"];
        var newfriend = {name : friendname};

        friend.push(newfriend);

        obj[username]["friend"] = friend;

        json = JSON.stringify(obj);
        fs.writeFile(__dirname + "/../data/user.json", json, 'utf8', function(err, data){

        });
      }
    });
  });

  //친구 블락 하기
  app.post('/main/friendBlock', function (req, res){
    // 지정한 아이디를 브락처리 한다.
  });


  //스케쥴 화면 이동
  app.post('/main/schedule', function (req, res){
    //res.render('mainSchedule');
    res.sendFile('mainSchedule1.html', {root:__dirname + "/../views/"});

  });

  //사용자의 스케줄 정보를 요청한다.
  app.post('/main/schedule/init', function(req,res){

    var sess = req.session;
    var username = sess.username;
    console.log("username : " + username);

    //파일을 읽어서 스케줄을 가져온다.
    fs.readFile(__dirname + "/../data/userSchedule.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);
        var resultArray = obj[username];

        res.json({result : resultArray});
      }
    });
  });

  app.post('/main/schedule/requestPart', function(req,res){
    fs.readFile(__dirname + "/../data/partInfo.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);
        var resultArray = new Array();

        //key 값을 추출하자..
        for(var key in obj)
        {
          console.log("key .. : " + key);
          resultArray.push(key);
        }

        res.json({result : resultArray});
      }
    });
  });

  //운동명 요청
  app.post('/main/schedule/requestPartEx', function(req, res){

    //parameter
    var partName = req.body.params.partName;
    console.log("[server] requestPart:partName : " + partName);
    //메모리로 올릴까? 파일로 읽어올까..
    fs.readFile(__dirname + "/../data/partInfo.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);
        var resultArray;

        resultArray = obj[partName];
        res.json({result : resultArray});
      }
    });
  });

  //스케줄 저장
  app.post('/main/schedule/save', function(req, res){

    //parameter
    var userSchedule = req.body.params.schedule;
    console.log("[server] requestPart:partName : " + userSchedule);

    var session = req.session;
    var username = session.username;
    console.log("username : " + username);

    //메모리로 올릴까? 파일로 읽어올까..
    fs.readFile(__dirname + "/../data/userSchedule.json", "utf8", function(err, data){
      if(err){
        console.log(err);
      }else{
        var obj = JSON.parse(data);

        var fileUserSchedule;
        //프러퍼티가 존재 하는지 확인한다..
        if(obj.hasOwnProperty(fileUserSchedule)){
          obj[username] = userSchedule;
        }else {
          //프로퍼티가 없는 경우..
          obj[username] = userSchedule;
        }

        json = JSON.stringify(obj);
        fs.writeFile(__dirname + "/../data/userSchedule.json", json, 'utf8', function(err, data){

        });
      }
    });
  });


  /**
   * 파일 업로드..
   */
  app.post('/file-upload', function(req, res) {
    // get the temporary location of the file

    upload(req, res).then(function (file){
      res.json(file);
    }, function (err){
      res.send(500, err);
    });

  });


  var upload = function (req, res) {
    var deferred = Q.defer();
    var storage = multer.diskStorage({
      // 서버에 저장할 폴더
      destination: function (req, file, cb) {
        cb(null, imagePath);
      },

      // 서버에 저장할 파일 명
      filename: function (req, file, cb) {
        file.uploadedFile = {
          name: req.params.filename,
          ext: file.mimetype.split('/')[1]
        };
        cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
      }
    });

    var upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
      if (err) deferred.reject();
      else deferred.resolve(req.file.uploadedFile);
    });
    return deferred.promise;
  };




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
      var info = data.result;
      console.log("[server] on load - data name : " + info.name + " , address : " + info.address + ", interestedpart : " + info.interestedPart );
      //socket.request.session;
      //소켓에 사용자 등록하기...
      socket.username = info.username;
      socket.name = info.name;
      socket.bodyType = info.bodyType;
      socket.address = info.address;
      socket.interestedPart  = info.interestedPart ;
      socket.weakPart = info.weakPart;
      socket.strongPart = info.strongPart;
      socket.filter = info.filter;
      //socket.filter = info.filter;

      //연결된 클라이언트 정보르 ㄹ가져온다..
      //var connectedClient = getConnectedClient(io, socket);
      var connectedClient = getConnectedClientFromFilter(io, socket);

      if(connectedClient.length > 0)
      {
        socket.emit('peopleinserver', {connectedClient: connectedClient});
      }else{
        socket.emit('peopleinserver', {connectedClient: 0});
      }


      //socket.emit('peopleinchat', {number: connectedCount});
    });

    // 클라이언트로 부터 'login' 수신 시
    socket.on('login', function(data) {

      console.log("[server] on login - data name : " + data.name + " , address : " + data.address + ", interestedpart : " + data.interestedPart );

      //소켓에 사용자 등록하기...
      socket.username = data.user;
      socket.useraddress = data.address;
      socket.userinterestedpart = data.interestedpart;

      //연결된 클라이언트 정보르 ㄹ가져온다..
      //var connectedClient = getConnectedClient(io, socket);
      var connectedClient = getConnectedClientFromFilter(io, socket);
      if(connectedClient.length > 0)
      {
        socket.emit('peopleinserver', {connectedClient: connectedClient});
      }else{
        socket.emit('peopleinserver', {connectedClient: 0});
      }

    });

    //서버에 접속한 사람들에 대한 정보를 다시 요청한다.
    socket.on('refresh', function(data) {
      //var connectedClient = getConnectedClient(io, socket);
      var connectedClient = getConnectedClientFromFilter(io, socket);

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

      var retVal = {fromName : socket.name,
                    fromUsername : socket.username,
                    fromAddress:socket.address,
                    fromInterestedPart:socket.interestedPart,
                    fromSocket:socket.id,
                    fromBodyType:socket.bodyType,
                    fromWeakPart:socket.weakPart,
                    fromStrongPart:socket.strongPart,
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
      console.log("[server] on disconnect called..");
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

      console.log("[server] on msg - data.msg : " + data.msg + ", socket room : " + socket.room );
      // When the server receives a message, it sends it to the other person in the room.
      //서버에 저장하자..대화내용을
      //var fileName = "userChat_"+data.user+"_"+data.targetuser+".json";
      var mobj = {};
      mobj.msg = data.msg;
      mobj.name = data.user;
      mobj.date = "20161202";

      var fileName = "userChat_"+data.user+ ".json";
      updateChatContent(fileName, data.user, data.targetuser, mobj);
      var receiverName = "userChat_" + data.targetuser + ".json";
      updateChatContent(receiverName, data.targetuser, data.user, mobj);



      socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
    });

    //채팅 내용을 저장한다.
    function updateChatContent(fileName, username, targetname, mobj)
    {
      //파일이 있는지 체크한다.
      var fullFileName = "/../data/" + fileName;
/*      var username = data.user;
      var targetname = data.targetuser;
      var msg = data.msg;*/
      //객체 생성


      fileCheck(fullFileName, username, targetname, mobj);

    }

    /**
     *  파일을 체크한다.
     * @param fullfileName
     * @param username
     * @param targetname
     * @param mobj
     */
    function fileCheck(fullFileName,username, targetname, mobj)
    {
      fs.exists(__dirname + fullFileName, function(exists) {
        if (exists) {
          // 파일이 존재 하는 경우..
          //파일을 읽는다.
          fs.readFile(__dirname + fullFileName, "utf8", function(err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log("reading start!!");
              var obj = JSON.parse(data);
              var userObj;
              //프러퍼티가 존재 하는지 확인한다..
              if(obj.hasOwnProperty(username)){
                userObj = obj[username];
              }else {
                //프로퍼티가 없는 경우..
                var tobj = {};
                var array = new Array();
                tobj.with = targetname;
                tobj.msglist = new Array();
                tobj.msglist.push(mobj);
                array.push(tobj);

                obj[username] = array;
              }



              for(var i in userObj)
              {
                var msgGroup = userObj[i];
                if(msgGroup.with === targetname)
                {
                  msgGroup.msglist.push(mobj)
                  break;
                }
              }
              var json = JSON.stringify(obj);

              fs.writeFile(__dirname + fullFileName, json, 'utf8', function (err, data) {
                console.log("update success..");
              });
            }
          });

        } else {
          //file 생성성
          console.log("filecreate");
          var obj = {};
          var tobj = {};
          var array = new Array();
          tobj.msglist = new Array();
          tobj.with = targetname;
          tobj.msglist.push(mobj);
          array.push(tobj);

          var userObj = {};
          obj[username] = array;

          var json = JSON.stringify(obj);
          fs.writeFile(__dirname + fullFileName, json, 'utf8', function (err) {
            if (err) {
              console.log("error!!!");
              throw err;
            }

            console.log('It\'s saved! in same location.');
          });
        }
      });
    }

    function createMsg()
    {

    }

    //채팅 내용을 제거한다.
    function deleteChatContent()
    {

    }

    //친구 요청 처리 하기
    socket.on('friendStatusRequest', function(data){

     // console.log("[server]friendStatusrequest - data : " + data);
      //해당 친구들을 바탕으로 실제로 접속했는지 확인한다..
      var result = getConnectedFriend(io, socket, data.data);

      socket.emit('friendStatusResponse', {result : result});

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
      obj.username = clients[connectedIds[i]].username;
      obj.name = clients[connectedIds[i]].name;
      obj.address = clients[connectedIds[i]].address;
      obj.interestedPart = clients[connectedIds[i]].interestedPart;
      obj.weakPart = clients[connectedIds[i]].weakPart;
      obj.strongPart = clients[connectedIds[i]].strongPart;

      obj.clientId = connectedIds[i];
      //array[i] = obj;
      array.push(obj);

    }
  }

  return array;
}

/**
 * 접속한 사용자의 설정에 따라서 회원들을 검색한다..
 */
function getConnectedClientFromFilter(io, socket)
{


  //1. 클라이언트 소켓의 필터 정보를 바탕으로 설정한 친구들을 찾는다.

  //1. 소켓에 연결된 클라이언트 정보들을 가져온다..
  var clients = io.sockets.connected;
  var userFilter = socket.filter;
  console.log("[server] getClientFromFilter -- socket filter : " + userFilter);

  //2. 클라이언트들의 소켓 아이이디를 추출한다.
  var connectedIds = Object.keys(clients);      //클라이언트 들의 소켓 아이디를 검색한다..
  var connectedCount = connectedIds.length;

  // 서버에 접속한 클라이언트를 계산한다.
  var array = new Array();
  if(connectedCount > 0) {

    var f_address = userFilter.f_address;
    var f_bodyType = userFilter.f_bodyType;

    if(f_address === "전체" && f_bodyType === "전체")
    {
      console.log("---------전체 필터링..");
      //전부 다 저장 한다.
      for (var i in connectedIds) {

        //사용자 필터를 바탕으로 소켓에 저장된 현재 접속된 사용자의 정보를 캡쳐한다.
        if (connectedIds[i] === socket.id) continue;

        var obj = new Object();
        obj.username = clients[connectedIds[i]].username;
        obj.name = clients[connectedIds[i]].name;
        obj.address = clients[connectedIds[i]].address;
        obj.interestedPart = clients[connectedIds[i]].interestedPart;
        obj.weakPart = clients[connectedIds[i]].weakPart;
        obj.strongPart = clients[connectedIds[i]].strongPart;

        obj.clientId = connectedIds[i];
        //array[i] = obj;
        array.push(obj);
      }
    }else
    {
      for (var i in connectedIds) {

        //사용자 필터를 바탕으로 소켓에 저장된 현재 접속된 사용자의 정보를 캡쳐한다.
        if (connectedIds[i] === socket.id) continue;

        var c_address = clients[connectedIds[i]].address;       //접속자 정보들..
        var c_bodyType = clients[connectedIds[i]].bodyType;

        if(f_address === "전체")
        {
          if(f_bodyType == c_bodyType)
          {
            var obj = new Object();
            obj.username = clients[connectedIds[i]].username;
            obj.name = clients[connectedIds[i]].name;
            obj.address = clients[connectedIds[i]].address;
            obj.interestedPart = clients[connectedIds[i]].interestedPart;
            obj.weakPart = clients[connectedIds[i]].weakPart;
            obj.strongPart = clients[connectedIds[i]].strongPart;

            obj.clientId = connectedIds[i];
            //array[i] = obj;
            array.push(obj);
          }
        }else if(f_bodyType === "전체")
        {
          if(f_address == c_address)
          {
            var obj = new Object();
            obj.username = clients[connectedIds[i]].username;
            obj.name = clients[connectedIds[i]].name;
            obj.address = clients[connectedIds[i]].address;
            obj.interestedPart = clients[connectedIds[i]].interestedPart;
            obj.weakPart = clients[connectedIds[i]].weakPart;
            obj.strongPart = clients[connectedIds[i]].strongPart;

            obj.clientId = connectedIds[i];
            //array[i] = obj;
            array.push(obj);
          }
        }else {

          if (f_address === c_address && f_bodyType === c_bodyType) {
            var obj = new Object();
            obj.username = clients[connectedIds[i]].username;
            obj.name = clients[connectedIds[i]].name;
            obj.address = clients[connectedIds[i]].address;
            obj.interestedPart = clients[connectedIds[i]].interestedPart;
            obj.weakPart = clients[connectedIds[i]].weakPart;
            obj.strongPart = clients[connectedIds[i]].strongPart;

            obj.clientId = connectedIds[i];
            //array[i] = obj;
            array.push(obj);
          }
        }
      }
    }

  }
  return array;
}


function getConnectedFriend(io, socket, friendList)
{
  //소켓에 접속한 친구가 있는지 확인한다.

  var clients = io.sockets.connected;
  var connectedIds = Object.keys(clients);      //클라이언트 들의 소켓 아이디를 검색한다..
  var connectedCount = connectedIds.length;

  // 서버에 접속한 클라이언트를 계산한다.
  var array = new Array();
  if(connectedCount > 0) {

    for (var j in friendList) {

      var friend = friendList[j];

      var obj = new Object();
      obj.name = friend.name;
      obj.status = 'off';

      for (var i in connectedIds) {
        if (connectedIds[i] === socket.id) {
          continue;
        }
      //  console.log("client name : " + clients[connectedIds[i]].username + ", friendName : " +  friend.name);
        if (clients[connectedIds[i]].username === friend.name) {
          //console.log("client name : " + clients[connectedIds[i]].username + ", friendName : " +  friend.name);
          obj.status = 'on';
          break;
        }
      }

      array.push(obj);

    }

    return array;
  }





  console.log("getClientFriend usernmae : " + username);
  fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data){
    var users = JSON.parse(data);
    var userFriend;
    //클라이언트로부터 값을 받아온다..
    var username = username;

    var result = {};
    if(!users[username]){
      // USERNAME NOT FOUND
      result["success"] = 0;
      result["error"] = "not found";

      //res.redirect('/');
      return;
    }

    //친구 정보를 등록한다.
    userFriend = users[username]["friend"];
    return userFriend;
    /*


    if(users[username]["password"] == password){
      result["success"] = 1;
      sess.username = username;
      sess.name = users[username]["name"];
      sess.address = users[username]["address"];
      sess.interestedPart = users[username]["interestedPart"];
      sess.bodyType = users[username]["bodyType"];
      sess.weakPart = users[username]["weakPart"];
      sess.strongPart = users[username]["strongPart"];
      sess.filter = users[username]["filter"];


      res.json(result);
      //res.redirect('/main');
      //res.render("main", {username:username});

    }else{
      result["success"] = 0;
      result["error"] = "incorrect";
      res.json(result);


    }*/
  })

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
