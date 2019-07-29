// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');

// Export a function, so that we can pass
// the app and io instances from the app.js file:

//커넥션 관리
var g_connectionList = new Array();

//최초 요청시 home을 보여준다..
module.exports = function(app,io, fs, mongoUtil){

  var db = mongoUtil.getDb();


  while (g_connectionList.length > 0) {
    g_connectionList.pop();
  } // Fastest

  /** 로그인 프로세서 **/
  login_post = function(req, res)
  {

    res.status(200);
    var userId = req.username;
    var password = req.password;
   // var userCollection = db.collection('user');
    var userCollection = getCollectionFromStr('user');

    console.log("userid : " + userId + ", password : " + password);
    //Check user from MongoDB
    userCollection.findOne({userId: userId, password: password}, function (err, user){
      console.log("user : " + user);
      var result = {};
      if(user != null)
      {
        //session registration
        req.session.login = "login";
        req.session.userId = user.userId;
        req.session.name = user.name;
        req.session.city = user.city;
        req.session.interestedPart = user.interestedPart;
        req.session.bodyType = user.bodyType;
        req.session.strongPart = user.strongPart;
        req.session.weakPart = user.weakPart;


        //connection Pool 에 넣자..
        g_connectionList.push(user);



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

  requestFriend_post = function (req, res){

    console.log("[server] requestFriend_post is called..");
    var userId = req.userId;
    var userCollection = db.collection('user');
    var userFriendCollection = db.collection('user_friend');

    //여기서 함수를 새롭게 호출하자..
    var result = getRequestFriendList(userId, userCollection, userFriendCollection,req, res, requestFriend_postResult);
    console.log("===result : " + result);
  }

  //user_friend 테이블을 검색하여, 그 결과를 반환한다.
  requestFriend_postResult = function(req, res, result)
  {
    console.log("requestFriend_postResult");
    res.json(result)
  }

  //Collection을 반환한다.
  function getCollectionFromStr(str)
  {
    return db.collection(str);
  }

  function returnValue(retVal)
  {
    return retVal;
  }

  function getUserObjectId(userId, userCollection, callback)
  {
    userCollection.findOne({userId: userId}, getUserObjectIdCallBack);

    function getUserObjectIdCallBack(err, result)
    {
      if (err) {
        console.log(err);
        throw err;
      } else {
        console.log("getUserID inner func is called... result.. " + result);
        if (result != null) {
          //user_friend 와 Join 한다.
          console.log("getUserID is called... obj id : " + result._id.toHexString());
          var objId = result._id.toHexString();     //obj id를 얻는다.
          //obj id로 user friend 테이블을 검색한다.
          callback(objId);
        }
      }
    }
  }



  function getRequestFriendList(userId, userCollection, userFriendCollection, req, res, callback) {
    console.log("getRequestFriendList is called..");
    var itemsProcessed = 0;
    var result = {};
    userCollection.findOne({userId: userId}, getUserId);



    function getUserId(err, result) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        console.log("getUserID inner func is called... result.. " + result);
        if (result != null) {
          //user_friend 와 Join 한다.
          console.log("getUserID is called... obj id : " + result._id.toHexString());
          var objId = result._id.toHexString();     //obj id를 얻는다.
          //obj id로 user friend 테이블을 검색한다.
          userFriendCollection.find({userObjId: new ObjectID(objId)}).toArray(getUserFriendList);
        }
      }

      function getUserFriendList(err, items) {
        console.log("getUserFriendList inner func is called.. itesm : " + items);
        var userFriendList = new Array();
        var itemsLength = items.length;


        for (var i in items) {
          var friendObjId = items[i].friendObjId;
          userCollection.findOne({_id: new ObjectID(friendObjId.toHexString())}, getUserFriend);

        }

        function getUserFriend(err, result) {

          console.log("getUserFriend inner func is called..");
          itemsProcessed++;
          userFriendList.push(result);

          if(itemsProcessed === itemsLength)
          {
            callback(req,res,userFriendList);
            //returnUserFriendList();
          }

        }

        function returnUserFriendList()
        {
          console.log("returnUserFriendList inner func is called..");
          return userFriendList;
        }
        console.log("getUserFriendList inner func is close");

      }
      console.log("getUserID inner func is close");
    }
    console.log("getRequestFriendList is close..");
  }

  requestProfile_post = function (req, res)
  {
    var profileUserId = req.userId;
    getUserOne(profileUserId, res, sendResponseSucess);
  }



  /** user table에서 한개의 user 프로필 정보를 반환한다. **/
  function getUserOne(userId, res, callback)
  {
    var userCollection = getCollectionFromStr('user');
    //Check user from MongoDB
    userCollection.findOne({userId: userId}, function (err, user){

      if(user != null)
      {
        //session registration
        callback(res, user)
      }else {
        console.log("user is not found");
      }
    });
  }

  sendResponseSucess = function(res, result)
  {
    res.json(result);
  }

  sendResponseFailed = function(res)
  {
    var result = {};
    result["sucess"] = -1;
    res.json(result);
  }




  /** -------------URL Process -----**/

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
    var result = {userId : session.userId,
        name : session.name,
        city : session.city,
        gu : session.gu,
        interestedPart : session.interestedPart,
        bodyType :session.bodyType,
        weakPart : session.weakPart,
        strongPart :session.strongPart,
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

  app.get('/main/profileRequest/:userId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.userId = req.params.userId;     //해당 방법은 url에서 가져오는 방법
    next();
    console.log("[server] profileRequest userId : " + req.userId);
  },requestProfile_post );



  //친구 정보 요청
  app.post('/main/friendRequest', function(req, res, next){

    //1. 세션에서 사용자 정보를 가져온다.
    req.userId = req.session.userId;
    //2. 디비에서 친구 정보를 가져오자.
    next();


     //친구 정보를 등록한다.
/*      userFriend = users[username]["friend"];
      res.json({result: userFriend});
    });*!/*/
  }, requestFriend_post);

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


  function getGConnectionList()
  {
    return g_connectionList;
  }
}
