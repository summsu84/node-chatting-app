/**
 * Created by JJW on 2016-12-14.
 */

/** PostHandler이다 **/


var db;
var ObjectID = require('mongodb').ObjectID;
exports.init = function(_db)
{
    db = _db;
    console.log("post_handler init..");
}


exports.login_post =  function(req, res)
{

    res.status(200);
    var userId = req.username;
    var password = req.password;
    console.log("userid : " + userId + ", password : " + password);

    // var userCollection = db.collection('user');
    var userCollection = getCollectionFromStr('user');


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
            //g_connectionList.push(user);
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

/**
 *  사인업 프로시저
 * @param req
 * @param res
 */
exports.signUp_post = function(req, res)
{

    var signUpObject = req.signUpObject;

    var userCollection = getCollectionFromStr('user');

    //Check user from MongoDB
    userCollection.insertOne(
        {
            userId: signUpObject.userId,
            password: signUpObject.password,
            name : signUpObject.username,
            city : signUpObject.city,
            gu : signUpObject.gu,
            interestedPart : signUpObject.interestedPart,
            bodyType : signUpObject.bodyType,
            weakPart : signUpObject.weakPart,
            strongPart : signUpObject.strongPart,
            created : new Date(),
            online : true,
            lastConnected: new Date(),
            lastDisconnected: new Date()

        }, function (err, result){
            assert.equal(err, null);

            console.log("Inserted a document into the user collection");
            res.json(result);
        });
}

//20170307 - test용
exports.signUp_Test_post = function(req, res)
{

    var signUpObject = req.signUpObject;

    var userCollection = getCollectionFromStr('user');

    //Check user from MongoDB
   /* userCollection.insertOne(
        {
            userId: signUpObject.userId,
            password: signUpObject.password,
            name : signUpObject.username,
            city : signUpObject.city,
            gu : signUpObject.gu,
            interestedPart : signUpObject.interestedPart,
            bodyType : signUpObject.bodyType,
            weakPart : signUpObject.weakPart,
            strongPart : signUpObject.strongPart,
            created : new Date(),
            online : true,
            lastConnected: new Date(),
            lastDisconnected: new Date()

        }, function (err, result){
            assert.equal(err, null);

            console.log("Inserted a document into the user collection");
            res.json(result);
        });*/
   var retval = {
       user_id : signUpObject.userId,
       result : 'succes'
   }
   res.json(retval);
}

//필터 정보 요청
exports.requestUserFilterInfo_post = function (req, res)
{

    var userId = req.userId;
    getUserFilterInfo(userId, res, sendResponseSucess);
}



exports.requestFriend_post = function (req, res){

    console.log("[server] requestFriend_post is called..");
    var userId = req.userId;
    var userCollection = db.collection('user');
    var userFriendCollection = db.collection('user_friend');

    //여기서 함수를 새롭게 호출하자..
    var result = getRequestFriendList(userId, userCollection, userFriendCollection,req, res, requestFriend_postResult);
    console.log("===result : " + result);


}

/**
 * 친구를 등록한다.
 * @param req
 * @param res
 */
exports.requestFriendAdd_post = function (req, res){

    var userId = req.userId;
    var userCollection = db.collection('user');
    var userFriendCollection = db.collection('user_friend');

    addFriend();


    var result = getRequestFriendList(userId, userCollection, userFriendCollection,req, res, requestFriend_postResult);
    console.log("===result : " + result);


}

/**
 * 친구를 삭제한다.
 * @param req
 * @param res
 */
exports.requestFriendDelete_post = function (req, res){

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

exports.requestProfile_post = function (req, res)
{
    var profileUserId = req.userId;
    getUserOne(profileUserId, res, sendResponseSucess);
}

exports.requestProfileByObjectId_post = function (req, res)
{
    var profileObjectId = req.objectId;
    getUserOneBuObjectId(profileObjectId, res, sendResponseSucess);
}

exports.requestChatList_post = function (req, res)
{
    var requestUserId = req.userId;
    getUserChatList(requestUserId, res, req, requestUserChatList_postResult);
}

/**
 * 채팅 이력을 가져온다.
 * @param req
 * @param res
 */
exports.requestChatDetail_post = function(req,res)
{
    var chatObjecctId = req.chatObjecctId;
    getUserChatDetail(chatObjecctId, res, sendResponseSucess);
}

exports.updateChatMsgChecked_post = function(req, res)
{
    console.log("[server] updateChatMsgChecked Post");
    var chatObjecctId = req.chatObjecctId;
    updateChatMsgChecked(chatObjecctId, res, sendResponseSucess);
}


exports.requestChatRoomID_post = function(req, res)
{
    console.log("[server] requestChatRoomID_post Post");
    var chatObjecctId = req.chatObjecctId;
    getChatRoomId(chatObjecctId, res, sendResponseSucess);
}

exports.updateUserProfileFilter_post = function(req, res)
{
    var userId = req.userId;
    var filter = req.body.filter;

    updateUserProfileFilter(userId, filter, res, sendResponseSucess);

}


exports.requestCalendar_post = function (req, res){

    var userId = req.userId;

    requestUserCalendar(userId, res, sendResponseSucess)

}


/**
 *  주소 정보를 가져온다.
 * @param req
 * @param res
 */
exports.requestCity_post = function(req, res)
{
    getCity(res, sendResponseSucess);
}

exports.requestGu_post = function(req, res)
{
    getGu(res, sendResponseSucess);
}


exports.requestPart_post = function(req, res)
{
    getPart(res, sendResponseSucess);
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


//Collection을 반환한다.
function getCollectionFromStr(str)
{
    return db.collection(str);
}


function getCity(res, callback)
{
    var cityCollection = getCollectionFromStr('city');
    cityCollection.find({}).toArray(function(err, result){
        callback(res, result);
    });

}

function getGu(res, callback)
{
    var guCollection = getCollectionFromStr('gu');
    guCollection.find({}).toArray(function(err, result){
        callback(res, result);
    });

}

function getPart(res, callback)
{
    var partCollection = getCollectionFromStr('part');
    partCollection.find({}).toArray(function(err, result){
        callback(res, result);
    });

}

//User Filter Info
function getUserFilterInfo(userId, res, callback)
{
    var userFilterCollection = getCollectionFromStr('user_filter');
    userFilterCollection.findOne({userId : userId}, function (err, result){
        if(result != null)
        {
            //session registration
            console.log("result : " + result.filterInterestedPart);
            callback(res, result)
        }else {
            console.log("userFilter is not found");
            var result = {};
            result.resultSucess = -1;
            res.json(result);
        }
    })
}

/**
 *  유저 정보를 가져온다.
 * @param userId
 * @param res
 * @param callback
 */
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

function getUserOneBuObjectId(objectId, res, callback)
{
    var userCollection = getCollectionFromStr('user');
    //Check user from MongoDB
    userCollection.findOne(
        {
            _id: new ObjectID(objectId)
        }, function (err, user){

        if(user != null)
        {
            //session registration
            callback(res, user)
        }else {
            console.log("user is not found");
        }
    });
}

/**
 * 사용자의 채팅 목록을 가져온다.
 * @param userId
 * @param res
 * @param callback
 */
function getUserChatList(userId, res, req, callback)
{
    var userCollection = getCollectionFromStr('user');
    var chatCollection = getCollectionFromStr('chat');
    var ChatMsgCollection = getCollectionFromStr('chatMsg');

    var itemsProcessed = 0;
    var resultArray = new Array();

    //1. userObjectId를 가져온다.
    var userObjectId = getConnectionUserFromConnectionPool(userId);
    console.log("uerObjectId : " + userObjectId);
    //2. chatCollection에서 해당 ObjectId를 가진 리스트를 가져온다.
    // userFriendCollection.find({userObjId: new ObjectID(objId)}).toArray(getUserFriendList);
    chatCollection.find({
        userObjectId:userObjectId._id
    }).toArray(getUserChatMsgList);

    function getUserChatMsgList(err, result)
    {
        console.log("getUserChatMsgList inner func is called.. result : " + result);
        var itemsLength = result.length;
        for(var i in result)
        {

            var chatObjectId = result[i]._id.toHexString();
            var friendUserName = result[i].friendUserName;
            var friendObjectId = result[i].friendObjectId;
            var resultInfo = result[i];
            console.log("chatobjectid : " + chatObjectId + ", friendUserName : " + friendUserName + ", friendObjectId : " + friendObjectId);
            getUserChatMsgList(resultInfo);
            //가장 최근의 chatMsg를 가져온다.
            /*ChatMsgCollection.findOne({
                chatObjectId: chatObjectId
            }, {}, { sort: { 'created' : -1 }}, function(err, result1){

                console.log("getUserChatMsgList inner func is called.. chatObjectId : " + result[i]._id.toHexString() + ", friendUserName : " + result[i].friendUserName + ", friendObjectId : " + result[i].friendObjectId);

                itemsProcessed++;
                result1.friendUserName = friendUserName;
                result1.friendObjectId = friendObjectId;
                resultArray.push(result1);

                if(itemsProcessed === itemsLength)
                {
                    callback(req,res,resultArray);
                    //returnUserFriendList();
                }
            });*/
        }

        function getUserChatMsgList(chatResultInfo){

            var chatObjectId = chatResultInfo._id.toHexString();
            var friendUserName = chatResultInfo.friendUserName;
            var friendObjectId = chatResultInfo.friendObjectId;

            ChatMsgCollection.findOne({
             chatObjectId: chatObjectId
             }, {}, { sort: { 'created' : -1 }}, function(err, result1){

             console.log("getUserChatMsgList inner func is called.. chatObjectId : " + chatObjectId + ", friendUserName : " + friendUserName + ", friendObjectId : " + friendObjectId);

             itemsProcessed++;
             result1.friendUserName = friendUserName;
             result1.friendObjectId = friendObjectId;
             resultArray.push(result1);

             if(itemsProcessed === itemsLength)
             {
                  callback(req,res,resultArray);
             //returnUserFriendList();
             }
             });
        }
    }



    /*//Check user from MongoDB
    userCollection.findOne({userId: userId}, function (err, user){

        if(user != null)
        {
            //session registration
            callback(res, user)
        }else {
            console.log("user is not found");
        }
    });*/
}

//user_friend 테이블을 검색하여, 그 결과를 반환한다.
requestUserChatList_postResult = function(req, res, data)
{
    console.log("requestUserChatList_postResult");

    //여기서 각 리스트에서 안읽은 메시지의 카운터를 계산하자. 일단은

    var itemsProcessed = 0;
    var itemsLength = data.length;

    for(var i in data)
    {
        var info = data[i];

        checkMsgCount(res, info);

        //아래는 inner함수의 값이 변경되는 문제 때문에 callback함수를 새롭게 정의
        /*chatMsgCollection.aggregate([
            {"$match":{
                "chatObjectId" : info.chatObjectId,
                "checked" : false
            }},
            {"$group": {
                "_id" : null,
                "count" :
                {
                    "$sum" : 1
                }
            }}
        ], function(err, result){
            if(err) {
                console.log("update failed.. err : " + err);
            }
            else {
                //console.log("update success cnt : " + result[0].count);

                itemsProcessed++;
                if(result.length === 0){
                    info.unchecekdMsgCount = 0;
                }else {
                    info.unchecekdMsgCount = result[0].count;
                }

                if(itemsProcessed === itemsLength)
                {
                    res.json(data)
                }

            }
        })*/
    }

    function checkMsgCount(res, info)
    {
        var chatMsgCollection = getCollectionFromStr('chatMsg');

        chatMsgCollection.aggregate([
            {"$match":{
                "chatObjectId" : info.chatObjectId,
                "checked" : false
            }},
            {"$group": {
                "_id" : null,
                "count" :
                {
                    "$sum" : 1
                }
            }}
        ], function(err, result){
            if(err) {
                console.log("update failed.. err : " + err);
            }
            else {
                //console.log("update success cnt : " + result[0].count);

                itemsProcessed++;
                if(result.length === 0){
                    info.unchecekdMsgCount = 0;
                }else {
                    info.unchecekdMsgCount = result[0].count;
                }

                if(itemsProcessed === itemsLength)
                {
                    res.json(data)
                }

            }
        })
    }


    //res.json(result)
}


function getUserChatDetail(chatObjectId, res, callback)
{
    var chatMsgCollection = getCollectionFromStr('chatMsg');

    //Check user from MongoDB
    chatMsgCollection.find(
        {
            chatObjectId: chatObjectId
        }).toArray(
        function (err, resultArray){

        if(resultArray != null)
        {
            //session registration
            callback(res, resultArray)
        }else {
            console.log("resultArray is not found");
        }
    });
}

function updateChatMsgChecked(chatObjectId, res, callback)
{
    console.log("updateChatMsgChecekd..chatobjectId : " + chatObjectId);
    var chatMsgCollection = getCollectionFromStr('chatMsg');
    var result = {};
    //Check user from MongoDB
    chatMsgCollection.updateMany(
        {
            chatObjectId: chatObjectId
        },
        {
            $set :
            {
                checked : true
            }
        }, function (err){

            if(err)
                console.log("update failed..");
            else {
                console.log("update success");
                result.success = 0;
                callback(res, result)
            }
        });
}



function getChatRoomId(chatObjectId, res, callback)
{
    var chatCollection = getCollectionFromStr('chat');
    //Check user from MongoDB
    chatCollection.findOne({
        _id: new ObjectID(chatObjectId)
    }, function(err, result){

        console.log("getChatRoomId inner func is called.. result : " + result);
        if(err)
            console.log("find failed..");
        else {
            console.log("find success");
            callback(res, result)
        }
    });
}

/**
 * 사용자의 스케줄을 가져온다.
 * @param userId
 * @param res
 * @param callback
 */
function requestUserCalendar(userId, res, callback)
{
    var userCollection = getCollectionFromStr('user');
    //Check user from MongoDB
    userCollection.findOne({userId: userId}, function (err, user){
        if(user != null)
        {
            //session registration
            getUserCalendar(user, res, callback)

        }else {
            console.log("user is not found");
        }
    });

    function getUserCalendar(user, res, callback)
    {
        var userObjectId = user._id.toHexString();

        var calendarMng = getCollectionFromStr('calendarMng');
        calendarMng.findOne({
            userObjectId: userObjectId
        }, function(err, result){

            console.log("requestUser Calendaer inner func is called.. result : " + result);

            if(err) {
                console.log("find failed..");
            }
            else {
                console.log("find success");
                callback(res, result);
            }
        });
    }




}

/**
 * 사용자 필터 정보를 업데이트 한다.
 * @param userId
 * @param filter
 * @param res
 * @param callback
 */
function updateUserProfileFilter(userId, filter,res, callback)
{
    var userFilterCollection = getCollectionFromStr('calendarMng');
    var filterTitle = filterTitle;
    var filterVal = filter.val;

    var query = {};
    query.userId = userId;
    query.filterInterestedPart = filterVal;

    userFilterCollection.update({"userId": userId},
        // {"$set" :{"userId" : userId, filterTitle : filterVal}},
        {"$set" : query},
        {"upsert" : true},
         function(err){
        if(err) {
            console.log("update failed.. err : " + err);
        }
        else {
            console.log("update success");
            callback(res, err);
        }
    });
}


function addFriend(res, callback)
{

}


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