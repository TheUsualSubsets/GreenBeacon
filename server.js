// basic server
var express = require('express');
var app = express();

// Middleware
var parser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var routes = require('./routes');
//this will only load the config file if on development server
//this is so we don't receive an error on heroku
if(process.env.NODE_ENV !== 'production') {
  var config = require('./config.js');
}

passport.serializeUser(function(id, done) {
  done(null, id);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// set configuration keys for Github authentication via Passport
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || config.keys.gitHubClientId,
  clientSecret: process.env.GITHUB_SECRET_KEY || config.keys.gitHubSecretKey,
  callbackURL: process.env.GIT_CALLBACK_URL || config.keys.gitCallbackUrl
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      return done(null, profile);
    });
  }
));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 600000*3} //30 mins
}));



app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/Client'));
app.use(parser.json());

routes.router(app);


app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function(){
  console.log('listening on port' + app.get('port'));
});

//socket.io
var io = require('socket.io')(server);

//establish socket connection
io.on('connection', function(socket){
  console.log('a user connected!');

  //socket event listeners / emitters
  socket.on('addTicket', function() {
    io.emit('ticketChange');
  });
  socket.on('claimTicket', function() {
    io.emit('ticketChange');
  });
  socket.on('eraseClaim', function() {
    io.emit('ticketChange');
  });
  socket.on('solveTicket', function() {
    io.emit('ticketChange');
  });
  socket.on('unsolveTicket', function() {
    io.emit('ticketChange');
  });
  socket.on('updateThresholds', function() {
    io.emit('ticketChange');
  });
  socket.on('unsolveTicket', function() {
    io.emit('ticketChange');
  });
  socket.on('updateUser', function() {
    io.emit('ticketChange');
  });


  socket.on('disconnect', function(){
    console.log('a user disconnected!');
  })
});

module.exports = server;
