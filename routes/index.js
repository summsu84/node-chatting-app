// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.
//커넥션 관리
var g_connectionList = new Array();

//최초 요청시 home을 보여준다..


function initExpress(app, db, fn) {

  console.log("initExpress called..");

  var postHandler = require('../modules/post_handler');

    //var db = mongoUtil.getDb();
  postHandler.init(db);

    while (g_connectionList.length > 0) {
      g_connectionList.pop();
    } // Fastest
    /** -------------URL Process -----**/

    app.get('/', function (req, res) {
      console.log("[server] main..");
      // Render views/main.html
      res.render('mSignup');
    });

    app.post('/login2', function (req, res, next) {

      /** body parser를 사용하기 위해 form 의 태그에 name 값 속성을 지정해줘야 하나.. **/
      //Express-session initialization
      console.log("[server] login2");

      req.username = req.body.params.username;
      req.password = req.body.params.password;
      next();

    }, postHandler.login_post);

  //회원 가입하기
  app.post('/main/signup', function(req, res, next)
  {
    //정보를 파싱하여 파일에 저장한다.
    var signObj = {
      userId: req.body.txt_user_id,
      username: req.body.txt_name,
      password: req.body.txt_password,
      city: req.body.sel_city,
      gu: req.body.sel_gu,
      interestedPart: req.body.sel_interested_part,
      bodyType: req.body.txt_body_type,
      strongPart: req.body.sel_strong_part,
      weakPart: req.body.sel_weak_part
    }

    req.signUpObject = signObj;
    next();
  }, postHandler.signUp_Test_post);


  //REQ_02 정보요청
  //1. 정보 요청
  //1.1 사용자 정보 요청 (접속 정보를 초기화 한다.)
  app.get('/main/userInfoRequest', function (req, res) {
    var session = req.session;
    var result = {
      userId: session.userId,
      name: session.name,
      city: session.city,
      gu: session.gu,
      interestedPart: session.interestedPart,
      bodyType: session.bodyType,
      weakPart: session.weakPart,
      strongPart: session.strongPart,
    };

    res.json({result: result});
  });

  //1.2 사용자 필터 요청
  app.get('/main/userFilterInfoRequest', function (req, res, next) {

    req.userId = req.session.userId;
    next();

  }, postHandler.requestUserFilterInfo_post);


  //1.3 지역 요청
  //1.3.1 시 요청
  app.get('/info/city', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    console.log("info city");
    next();

  },postHandler.requestCity_post );
  //1.3.2 구 요청
  app.get('/info/gu/:cityid', function(req, res,next){
    //db에서 유저 정보를 가져온다.

    req.cityObjectId = req.params.cityid;     //해당 방법은 url에서 가져오는 방법
    console.log("/info/gu/cityid : " + req.cityObjectId)
    next();

  },postHandler.requestGu_post );
  //1.4 바디 타입

  //1.5 부위 요청
  app.get('/info/part', function(req, res,next){

    console.log("info part");
    next();

  },postHandler.requestPart_post );
  //1.6 부위 Ex 요청





  //REQ_03 메인화면
  //1. 접속자

  //1.1 모든접속자

  //1.1.1 목록 보기

  //1.1.2 목록 클릭


  //1.2 친구 접속자

  //1.2.1 목록 보기 - 친구 정보 요청
  app.post('/main/friendRequest', function (req, res, next) {

    //1. 세션에서 사용자 정보를 가져온다.
    req.userId = req.session.userId;
    //2. 디비에서 친구 정보를 가져오자.
    next();

  }, postHandler.requestFriend_post);

  //1.2.2 목록 클릭 -> REQ_04 참고

  //2. 대화 목록
  //2.1 메인 화면
  //2.1.1 목록 보기 (대화 목록 리스트)
  app.get('/main/chatListRequest', function(req, res, next) {

    //현재 user Id와 targetId를 검색한다.
   // console.log("[server] on chatListRequest... : " + req.params.userId);
    req.userId = req.session.userId;     //해당 방법은 url에서 가져오는 방법
    next();
    console.log("[server] chatListRequest userId : " + req.userId);
  }, postHandler.requestChatList_post);

  /** MainChatStatus  detail 관련 **/
  app.get('/main/chatDetailRequest/:chatObjecctId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.chatObjecctId = req.params.chatObjecctId;     //해당 방법은 url에서 가져오는 방법
    next();
    console.log("[server] chatObjecctId userId : " + req.chatObjecctId);
  },postHandler.requestChatDetail_post );

  //checked update
  app.put('/main/chatMsgCheckedUpdate/:chatObjecctId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.chatObjecctId = req.params.chatObjecctId;     //해당 방법은 url에서 가져오는 방법
    next();
  },postHandler.updateChatMsgChecked_post );
  app.get('/main/chatRoomIDRequest/:chatObjecctId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.chatObjecctId = req.params.chatObjecctId;     //해당 방법은 url에서 가져오는 방법
    next();
  },postHandler.requestChatRoomID_post );


  //2.2 목록 선택
  //2.2.1 목록 클릭 (대화 목록 리스트 중 한 개 클릭)
  //- 대화 목록창에서 특정 대화를 클릭했을때, 해당 대화 내용들을 가져온다.
  app.post('/main/chatListDetailRequest:userId:targetId', function (req, res) {


   });
  //2.2.2 목록 삭제 (대화 목록창을 삭제 한다.) -- 차후 재정의
  app.post('/main/chat/delete', function (req, res) {


  });

  //REQ_04 - 프로필 보기
  //1. 프로필 보기
  //1.1 친구 프로필
  //1.1.1 친구 프로필 보기 -- 친구 프로필과 일반 프로필과 같이 사용할 것인지 체크 필요..

  //1.1.2 대화요청

  //1.1.3 친구 삭제 (친구 삭제하기 (DELETE))
  app.delete('/main/friendDelete', function (req, res, next) {

    //1. 세션에서 사용자 정보를 가져온다.
    req.userId = req.session.userId;
    //2. 디비에서 친구 정보를 가져오자.
    next();

  }, postHandler.requestFriendDelete_post);

  //1.2 일반 프로필
  //1.2.1 프로필 보기
  /** 프로필 관련 **/
  app.get('/main/profileRequest/:userId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.userId = req.params.userId;     //해당 방법은 url에서 가져오는 방법
    next();
    console.log("[server] profileRequest userId : " + req.userId);
  },postHandler.requestProfile_post );
  //ObjectId로 프로필 정보 가져오기
  app.get('/main/profileRequestByObjectId/:objectId', function(req, res,next){
    //db에서 유저 정보를 가져온다.
    req.objectId = req.params.objectId;     //해당 방법은 url에서 가져오는 방법
    next();
    console.log("[server] profileRequestByObjectId objectId : " + req.objectId);
  },postHandler.requestProfileByObjectId_post );

  //1.2.2 친구 추가하기
  //친구 등록하기 (POST)
  app.post('/main/friendAdd', function (req, res, next) {

    //1. 세션에서 사용자 정보를 가져온다.
    req.userId = req.session.userId;
    //2. 디비에서 친구 정보를 가져오자.
    next();

  }, postHandler.requestFriendAdd_post);

  //1.2.3 대화 요청


  //REQ_05 실시간 대화
  //1. 실시간 대화 화면
  //1.1 대화 요청

  //1.2 대화 수락 (?)

  //1.3 대화 하기


  //REQ_06 스케줄 관리
  app.get('/schedule/calendarRequest', function(req,res, next){
    req.userId = req.session.userId;     //해당 방법은 url에서 가져오는 방법
    next();
  }, postHandler.requestCalendar_post);


  //REQ_07 설정
  //1. 설정
  //1.1 프로필 설정

  //1.2 필터링 설정
  app.post('/conf/userProfileFilterUpdate', function(req, res, next){
    //db에서 유저 정보를 가져온다.

    req.userId = req.session.userId;     //해당 방법은 url에서 가져오는 방법
    next();

  },postHandler.updateUserProfileFilter_post );
  //1.3 스케줄 설정







    //프로파일을 업데이트 한다.
    app.post('/main/profile/update', function (req, res) {
      var session = req.session;
      var result = {
        username: session.username,
        name: session.name,
        address: session.address,
        interestedPart: session.interestedPart,
        bodyType: session.bodyType,
        weakPart: session.weakPart,
        strongPart: session.strongPart
      };

      res.json({result: result});
    });





  /*    app.get('/main/profileRequest/:userId', function (req, res, next) {
        //db에서 유저 정보를 가져온다.
        req.userId = req.params.userId;     //해당 방법은 url에서 가져오는 방법
        next();
        console.log("[server] profileRequest userId : " + req.userId);
      });*/










    //스케쥴 화면 이동
    app.post('/main/schedule', function (req, res) {
      //res.render('mainSchedule');
      res.sendFile('mainSchedule1.html', {root: __dirname + "/../views/"});

    });



    //사용자의 스케줄 정보를 요청한다.
    app.post('/main/schedule/init', function (req, res) {

      var sess = req.session;
      var username = sess.username;
      console.log("username : " + username);

      //파일을 읽어서 스케줄을 가져온다.
      fs.readFile(__dirname + "/../data/userSchedule.json", "utf8", function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var obj = JSON.parse(data);
          var resultArray = obj[username];

          res.json({result: resultArray});
        }
      });
    });

    app.post('/main/schedule/requestPart', function (req, res) {
      fs.readFile(__dirname + "/../data/partInfo.json", "utf8", function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var obj = JSON.parse(data);
          var resultArray = new Array();

          //key 값을 추출하자..
          for (var key in obj) {
            console.log("key .. : " + key);
            resultArray.push(key);
          }

          res.json({result: resultArray});
        }
      });
    });

    //운동명 요청
    app.post('/main/schedule/requestPartEx', function (req, res) {

      //parameter
      var partName = req.body.params.partName;
      console.log("[server] requestPart:partName : " + partName);
      //메모리로 올릴까? 파일로 읽어올까..
      fs.readFile(__dirname + "/../data/partInfo.json", "utf8", function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var obj = JSON.parse(data);
          var resultArray;

          resultArray = obj[partName];
          res.json({result: resultArray});
        }
      });
    });

    //스케줄 저장
    app.post('/main/schedule/save', function (req, res) {

      //parameter
      var userSchedule = req.body.params.schedule;
      console.log("[server] requestPart:partName : " + userSchedule);

      var session = req.session;
      var username = session.username;
      console.log("username : " + username);

      //메모리로 올릴까? 파일로 읽어올까..
      fs.readFile(__dirname + "/../data/userSchedule.json", "utf8", function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var obj = JSON.parse(data);

          var fileUserSchedule;
          //프러퍼티가 존재 하는지 확인한다..
          if (obj.hasOwnProperty(fileUserSchedule)) {
            obj[username] = userSchedule;
          } else {
            //프로퍼티가 없는 경우..
            obj[username] = userSchedule;
          }

          json = JSON.stringify(obj);
          fs.writeFile(__dirname + "/../data/userSchedule.json", json, 'utf8', function (err, data) {

          });
        }
      });
    });


  //Information Request





  fn();

    function getGConnectionList() {
      return g_connectionList;
    }
  }

  exports.initExpress = initExpress;
