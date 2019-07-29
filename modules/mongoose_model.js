/**
 * Created by JJW on 2016-12-14.
 */

/*var UserModel;
var UserFriendModel;
var chatModel;;
var chatMsgModel;*/

function defineModels(mongoose, fn)
{

    var ObjectId =  require('mongodb').ObjectID;

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


    // 모델 정의
    mongoose.model('user', userSchema);
    mongoose.model('user_friend', userFriendSchema);
    mongoose.model('chat', chatSchema);
    mongoose.model('chatMsg', chatMsgSchema);

    fn();
}

exports.defineModels = defineModels;