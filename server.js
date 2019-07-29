/**
 * Created by JJW on 2016-11-07.
 */
// This is the main file of our chat app. It initializes a new
// express.js instance, requires the config and routes files
// and listens on a port. Start the application by running
// 'node app.js' in your terminal


    //Package Loading..//
var express = require('express'),
    app = express();

//Express-session
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require("connect-redis")(session);
var fs = require("fs");
var path = require('path');

//mongoose
var mongoose = require('mongoose');

//Global Variable
var db, UserModel, UserFriendModel, ChatModel, ChatMsgModel;
global.g_connectionList = new Array();




app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
    extended:true
}));


app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));




// This is needed if the app is run on heroku:

var port = process.env.PORT || 50000;

// Initialize a new socket.io object. It is bound to
// the express app, which allows them to coexist.

var io = require('socket.io').listen(app.listen(port));

var initExpress = require('./routes');
var initSocketEvent = require('./modules/socket_event');
var mongooseModel = require('./modules/mongoose_model');



mongooseModel.defineModels(mongoose, function(){
    //Inner Function
    app.UserModel = UserModel = mongoose.model('user');
    app.UserFriendModel = UserFriendModel = mongoose.model('user_friend');
    app.ChatModel = ChatModel = mongoose.model('chat');
    app.chatMsgModel = ChatMsgModel = mongoose.model('chatMsg');


    mongoose.connect('mongodb://localhost/mongodb_demo', function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log("Connected to mongodb");

            db = mongoose.connection;

            initExpress.initExpress(app, db, function(){

                //MongoModeling..
                console.log("initExpress is finished..");

            });

            initSocketEvent.initSocketEvnet(io, db, function(){
                console.log("initSocketEvent is finished..");
            });

            //Socket IO Init
        }
    });


});


//콜백을 사용할건지..
//mongoose connection

//session use
var sessionMiddleware = session({
    store:new RedisStore({}),
    secret:"keyboard cat"
});
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Require the configuration and the routes files, and pass
// the app and io as arguments to the returned functions.


require('./config')(app, io);
//var route = require('./routes')(app, io, fs, mongoUtil);

//require('./modules/socket_event.js')(app, io, fs, mongoUtil, route);

console.log('Your application is running on http://localhost:' + port );
//db connection
//var mongoUtil = require('./modules/mongo_util');
/*
mongoUtil.connectToServer(function (err){
    //이름 없는 함수 콜백
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to mongodb");

        require('./config')(app, io);
        //var route = require('./routes')(app, io, fs, mongoUtil);

        //require('./modules/socket_event.js')(app, io, fs, mongoUtil, route);

        console.log('Your application is running on http://localhost:' + port );
    }
});*/

