/**
 * Created by JJW on 2016-12-14.
 */

//커넥션 풀은 차후 생성..

// 소켓 초기화
function initSocket_event(io, db, fn){

    var connectedCount = 0;
    console.log("scoket_event module called..  db :  " + db);
    var ObjectID = require('mongodb').ObjectID;


    //var db = mongoUtil.getDb();

    var v_socket = io.on('connection', function (socket) {
        console.log("user connected : " + socket.id);

        //클라이언트로 부터 'load' 수신
        socket.on('load',function(data){
            //전체 컨넥션 수를 알려주고, 접속자를 알려주도록 하자..
            var connectedUserInfo = data.result;
            console.log("[server] on load - data name : " + connectedUserInfo.userId + " , address : " + connectedUserInfo.gu + ", interestedpart : " + connectedUserInfo.interestedPart );

            //User 정보를 현재 socket에 저장하자.
            socket.connectedUserInfo = connectedUserInfo;

            //DB에 연결하여, 현재 온라인 상태의 사용자들을 보내준다.
            var connectedClient = getConnectedPeopleFromDB(db, emitPeopleInServer);
            getConnectionUserFromConnectionPool('kevin');
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

            var connectedClient = getConnectedPeopleFromDB(db, emitPeopleInServer);
        });

        //Inner function으로 넣자..
        function emitPeopleInServer(connectedPeopleList)
        {
            console.log("[server] emitPeopleInServer is called..");
            if(connectedPeopleList.length > 0)
            {
                socket.emit('peopleinserver', {connectedPeopleList: connectedPeopleList});
            }else{
                socket.emit('peopleinserver', {connectedPeopleList: 0});
            }
        }

        //상대방에게 대화를 요청한다..
        socket.on('chatwith', function(data) {

            //find client socket..
            console.log("[Server] on chatwith - data.targetUserId id : " + data.targetUserId + ", roomId : " + data.roomId);

            //상대방 소켓 정보를 검색한다..
            var targetsocket = getClient(io, data.targetUserId);
            //1. 상대방 소켓이 없는 것은 유저가 접속하지 않음
            if(targetsocket === undefined){
                //디비 처리
                console.log("[server] chat with target : " + data.targetUserId + " is no found");
                socket.emit('chatok', {
                    roomId : data.roomId
                });
            }
            //2. 상대방 소켓이 존재하는 것은 유저가 현재 접속한 것임
            else {
                console.log("[server] chat with target found : " + data.targetUserId);

                var roomId = data.roomId;
                var requestUserInfo = socket.connectedUserInfo;
                requestUserInfo.roomId = roomId;

                //방을 만든다..
                socket.join(roomId);
                socket.room = roomId;

                //상대방 소켓에 'chatfrom' 시그널을 보낸다.
                targetsocket.emit('chatfrom', {
                    requestUserInfo : requestUserInfo
                });
            }



            //만약 상대방 소켓이 존재 하지 않는 경우.. --> 접속 해제한 상태라고 판단한다..


        });

        //상대방에서 OK 버튼 클릭시 두사람간의 대화가 이루어진다..
        socket.on('chatok', function(data){
            // Add the client to the room (room으로 접속)
            console.log("[server] on chatok data-roomId : " + data.roomId);   //roomId 는 요청자에 의해서 생성된다..

            //대화를 요청당한 사용자가 대화에 조인한다..
            socket.join(data.roomId);
            socket.room = data.roomId;

            var targetsocket = getClient(io, data.requestUserId);

            targetsocket.emit('chatok', {
                roomId : data.roomId
            });
        });
        // Somebody left the chat
        socket.on('disconnect', function() {
            console.log("[server] on disconnect called.. socket_id : " + socket.id);
            // Notify the other person in the chat room
            // that his partner has left

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });

            updateConnectedClientOnLineStatus(db, socket.connectedUserInfo.userId);

            // leave the room
            socket.leave(socket.room);
        });


        // Handle the sending of messages
        socket.on('msg', function(data){

            console.log("[server] on msg - data.msg : " + data.msg + ", socket room : " + socket.room + ", senderId : " + data.senderUserId + ", receiver : " + data.receiverUserId + ", receiverUserName : " + data.receiverUserName);
            // When the server receives a message, it sends it to the other person in the room.
            //서버에 저장하자..대화내용을
            //var fileName = "userChat_"+data.user+"_"+data.targetuser+".json";

            var senderUserId = data.senderUserId;
            var receiverUserId = data.receiverUserId;
            var receiverUserName = data.receiverUserName;
            var roomId = 0;

            if((!socket.hasOwnProperty('room')) || socket.room === undefined)
            {
                roomId = data.roomId;
            }else {
                roomId = socket.room;
            }

            //MongoDB에 저장한다..
            //1. Collection을 가지고 온다.
            var userCollection = getCollectionFromStr(db,'user');
            //2. 페어 (userId와 ClientID)를 가지고 있는다.
            var senderUserObjectId = getConnectionUserFromConnectionPool(senderUserId);
            data.senderUserObjectId = senderUserObjectId._id;
            data.senderUserName = senderUserObjectId.name;

            var receiverUserObjectId = getConnectionUserFromConnectionPool(receiverUserId);
            //1. receiverUserObject가 존재 하면 소켓이 연결.. 아니면 비로그인
            if(receiverUserObjectId === undefined){
                data.receiverUserObjectId = new ObjectID(data.receiverUserObjectId);
                data.receiverUserName = data.receiverUserName;
            }else {
                data.receiverUserObjectId = receiverUserObjectId._id;
                data.receiverUserName = receiverUserObjectId.name;
            }

            console.log("[server] on msg - senderuserObjectId : " + data.senderUserObjectId + ", receiverUserObjectId : " + data.receiverUserObjectId );

            //3. chatSchema에 저장한다.
            insertChat(data, insertChatMsg);

            //4. 각 페어에 대하여, chatMsgSchema에 저장한다.



            /*
             var fileName = "userChat_"+data.user+ ".json";
             updateChatContent(fileName, data.user, data.targetuser, mobj);
             var receiverName = "userChat_" + data.targetuser + ".json";
             updateChatContent(receiverName, data.targetuser, data.user, mobj);*/



            socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user});
        });

        //chatScema에 저장하자..
        function insertChat(data, callback)
        {
            var chatCollection = getCollectionFromStr(db, 'chat');

            //update pair between sender and receiver
/*            var retVal = chatCollection.update(
                {
                    "userObjectId" : data.senderUserObjectId,
                    "friendObjectId" : data.receiverUserObjectId
                },
                {
                "userObjectId" : data.senderUserObjectId,
                "friendObjectId" : data.receiverUserObjectId

            }, {upsert:true}, function(err, result){
                // assert(err, null);
                console.log("Inserted a document into a chat collection.. resultObjectId"  + result.insertedId)
                callback(result._id, data);
            });*/
//Find and Insert if there is not exsist
            chatCollection.findAndModify(
                {
                    "userObjectId" : data.senderUserObjectId,
                    "friendObjectId" : data.receiverUserObjectId
                },
                [['_id','asc']],
                {
                    $setOnInsert:{
                        "userObjectId" : data.senderUserObjectId,
                        "friendObjectId" : data.receiverUserObjectId,
                        //friendName을 넣자
                        "friendUserName" : data.receiverUserName,
                        //roomId를 넣자
                        "roomId" : data.roomId

                    }
                },
                {upsert:true, new:true}, function(err, result){

                    var sender_objId = result.value._id.toHexString();     //obj id를 얻는다.

                    //receiver를 찾자..
                    chatCollection.findAndModify(
                    {
                        "userObjectId" : data.receiverUserObjectId,
                        "friendObjectId" : data.senderUserObjectId
                    },
                    [['_id','asc']],
                    {
                        $setOnInsert:{
                            "userObjectId" : data.receiverUserObjectId,
                            "friendObjectId" : data.senderUserObjectId,
                            //friendName을 넣자
                            "friendUserName" : data.senderUserName,
                            //room Id를 넣자
                            "roomId" : data.roomId
                        }
                    },
                    {
                        upsert:true, new:true
                    },
                        function(err, result) {

                            var receiver_objId = result.value._id.toHexString();

                            //chatMsg에서 추가하자..

                            //obj id로 user friend 테이블을 검색한다.
                            callback(sender_objId, receiver_objId, data);
                        });

                });
            //Bulk Operation으로 변경하자..

/*            var bulk = chatCollection.initializeUnorderedBulkOp();
            bulk.find({"userObjectId" : data.senderUserObjectId,
                "friendObjectId" : data.receiverUserObjectId}).update( {
                "userObjectId" : data.senderUserObjectId,
                "friendObjectId" : data.receiverUserObjectId

            } , {upsert:true, new:true});

            bulk.execute();
            bulk.find({"userObjectId" : data.receiverUserObjectId,
             "friendObjectId" : data.senderUserObjectId}).update( {
             "userObjectId" : data.receiverUserObjectId,
             "friendObjectId" : data.senderUserObjectId

             },  {upsert:true, new:true});
            bulk.execute();*/



            //console.log("retVal = " + retVal);
        }

        //chatMsgSchema에 저장하자.
        function insertChatMsg(sender_objId, receiver_objId, data)
        {
            var chatMsgCollection = getCollectionFromStr(db, 'chatMsg');

            chatMsgCollection.insertOne({
                "chatObjectId" : sender_objId,
                "name" : data.user,
                "msg" : data.msg,
                "checked" : true,
                "created" : new Date()
            }, function(err, result){
                // assert(err, null)
                console.log("Inserted a dcoument into a chatMsg collection... sender_objId" + result)

                //ReceiverObjId로 추가하자.
                chatMsgCollection.insertOne({
                    "chatObjectId" : receiver_objId,
                    "name" : data.user,
                    "msg" : data.msg,
                    "checked" : false,
                    "created" : new Date()
                }, function(err, result) {
                    // assert(err, null)
                    console.log("Inserted a dcoument into a chatMsg collection... receiver_objId" + result)
                });
            });

        }

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
        //소켓 room 설정
        socket.on('setRoomId', function(data){
            var roomId = data.roomId;

            socket.roomId = roomId;
        })

        socket.emit('text', 'wow. such event. very real time.');
    });

    fn();
};




/**
 * 특정 아이디를 가진 소켓 정보를 가져온다.
 * @param io
 * @param clientId      //대상 사용자 ID
 * @returns {*}
 */
function getClient(io, clientId)
{
    var clients = io.sockets.connected;
    //io.sockets.connected.id를 하면 가져 오겠네..?

    var connectedIds = Object.keys(clients);      //클라이언트 들의 소켓 아이디를 검색한다..
    var connectedCount = connectedIds.length;
    var clientSessionId;
    var clientSocket;
    if(connectedCount > 0) {

        for (var i in connectedIds) {

            if (clients[connectedIds[i]].connectedUserInfo.userId === clientId) {
                clientSessionId = connectedIds[i];
                clientSocket = clients[clientSessionId];
                break;
            }
        }
    }

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


    function setUserClientIdToDB(db, callback)
    {
        //1. DB에 해당 유저의 user 테이블에 client ID 정보를 저장한다.
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



}


//Collection을 반환한다.
function getCollectionFromStr(db, str)
{
    return db.collection(str);
}




function updateConnectedClientOnLineStatus(db, userId)
{
    console.log("[server] updateConnectedClientOnLineStatus is called.. userId : " + userId);
    var userCollection = db.collection('user');

    userCollection.update({userId: userId}, {$set:{online:false, lastDisconnected:new Date()}}, function(err){
        if(err)
            console.log("update failed..");
        else
            console.log("update success");
    });
}


/**
 * 접속한 사용자의 설정에 따라서 회원들을 검색한다..
 */
function getConnectedPeopleFromDB(db, callback)
{
    //1. DB에서 online 상태가 true인 사용자 정보를 가져온다.

    var userCollection = db.collection('user');

    //Check user from MongoDB
    userCollection.find(
            {online:true}
        ).toArray(
            function (err, userList){

            console.log("retrieved data : " + userList);

            callback(userList);
    });
    // 서버에 접속한 클라이언트를 계산한다.
    /* var array = new Array();
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
     }*/


    //return array;
}
//connectionListpool에서 접속자 정보를 가져온다..
function getConnectionUserFromConnectionPool(userId)
{

    var retVal;
    for(var i in g_connectionList)
    {
        if(userId === g_connectionList[i].userId)
        {
            retVal = g_connectionList[i];
        }
    }

    return retVal;
}


exports.initSocketEvnet = initSocket_event;