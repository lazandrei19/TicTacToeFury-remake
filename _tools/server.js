#!/usr/bin/env node
var debug = require('debug')('expressapp');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routesIndex = path.join(__dirname, "../_assets/routes/");
var index = require(path.join(routesIndex, 'index'));
var singleplayer = require(path.join(routesIndex, 'singleplayer'));
var multiplayer = require(path.join(routesIndex, 'multiplayer'));

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, "../_assets/views/"));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../_site/")));

app.use('/', index);
app.use('/singleplayer', singleplayer);
app.use('/multiplayer', multiplayer);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
			title: 'error'
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
		title: 'error'
	});
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});


//game code
var client = require('socket.io')(server);
var users = {};
var waitingUsers = [];
client.on('connection', function(socket) {
	socket.on('username', function(username) {
		socket.username = username;
		socket.lastPlay = null;
		socket.playingAgainst = null;
		users[username] = socket;
		if (waitingUsers.length > 0) {
			var index = Math.floor(Math.random() * waitingUsers.length);
			var user = waitingUsers[index];
			socket.lastPlay = user;
			socket.playingAgainst = user;
			var opponent = users[user];
			opponent.lastplay = socket.username;
			opponent.playingAgainst = socket.username;
			var turn = Math.floor(Math.random()) + 1;
			var oTurn = (turn === 1)? 2 : 1;
			socket.emit('gameStarted', turn);
			opponent.emit('gameStarted', oTurn);
		} else {
			waitingUsers.push(username);
		}
	});
	socket.on('move', function(data) {
		users[socket.playingAgainst].emit('opponentMove', data);
	});
	socket.on('disconnect', function() {
		delete users[socket.username];
		var index = waitingUsers.indexOf(socket.username);
		if(index > -1) {
			waitingUsers.splice(index, 1);
		}
	});
});
