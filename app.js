var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var useree = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var users = [];

io.on("connection", function (socket) {
    socket.on('disconnect', function () {
        delete users[socket.user];
        console.log(users);
    });
    console.log("A user connected");
    socket.on('login', function (data) {
        console.log('connected user' + socket.id + ' ' + data.user);
        users[data.user] = socket.id;
        console.log(users);
        socket.user = data.user;
    });
    socket.on('connect-user', function (data) {
        console.log('connect to other user' + socket.id + ' ' + data.user);
    });
    socket.on('send-ice', function (data) {
        console.log('ice' + socket.id + 'remote user' + JSON.stringify(data.to));
        //console.log(data.ice);
        //console.log('to user socket' + users[data.to]);
        io.to(users[data.to]).emit('receive-ice', data.ice);
    });
    socket.on('send-peer-ice', function (data) {
        console.log('ice from remote' + socket.id + 'remote user' + JSON.stringify(data.to));
        //console.log(data.ice);
        //console.log('to user socket' + users[data.to]);
        io.to(users[data.to]).emit('receive-peer-ice', data.ice);
    });
    socket.on('send-offer', function (data) {
        console.log('ice' + socket.id + 'remote user' + JSON.stringify(data.to));
        //console.log(data.offer);
        //console.log('to user socket' + users[data.to]);
        io.to(users[data.to]).emit('receive-offer', { offer: data.offer, from: data.from });
    });
    socket.on('send-answer', function (data) {
        console.log('answer' + socket.id + 'remote user' + JSON.stringify(data.to));
        //console.log(data.answer);
        //console.log('to user socket' + users[data.to]);
        io.to(users[data.to]).emit('receive-answer', data.answer);
    });
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', useree);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = {app: app, server: server};
