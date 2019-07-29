/**
 * Created by JJW on 2016-12-09.
 */

module.exports = function() {

    var ObjectID = require('mongodb').ObjectID;
    // test=require('assert');
    var mongoose = require('mongoose');
    var db;

    mongoose.connect('mongodb://localhost/mongodb_demo', function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
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
        crated: {type: Date, default: Date.now},
        online: Boolean,
        lastConnected: {type: Date, default: Date.now}
    });

    var userFriendSchema = mongoose.Schema({
        userObjId: mongoose.Schema.ObjectId,
        friendObjId: mongoose.Schema.ObjectId
    });

    var chatSchema = mongoose.Schema({
        userObjId: mongoose.Schema.ObjectId,
        friendId: String
    })

    var chatMsgSchema = mongoose.Schema({
        UserObjId: mongoose.Schema.ObjectId,
        name: String,
        msg: String,
        crated: {type: Date, default: Date.now}
    });


    var User = mongoose.model('user', userSchema);
    var UserFriend = mongoose.model('user_friend', userFriendSchema);
    var chatModel = mongoose.model('chat', chatSchema);
    var chatMsgModel = mongoose.model('chatMsg', chatMsgSchema);


}