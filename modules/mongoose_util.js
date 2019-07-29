/**
 * Created by JJW on 2016-12-14.
 */

var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var _db;
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


module.exports = {

    connectToServer: function( callback ) {
        MongoClient.connect( "mongodb://localhost:27017/mongodb_demo", function( err, db ) {
            _db = db;
            return callback( err );
        } );
    },

    getDb: function() {
        return _db;
    },

    //UserModel return
    getUserModel: function(){
        return User;
    },
    //UserFriend Collection Model

    getUserFriendModel: function(){
        return UserFriend;
    },

    //chat Collection Model
    getChatModel: function(){
        return chatModel;
    },

    //chatMsg Collection Model
    getChatMsgModel: function(){
        return chatMsgModel;
    }

};