var config = require('./config/config');

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    callbackURL: config.googleAuth.callbackURL,
    realm: config.realm,
    clientSecret: config.googleAuth.clientSecret,
    clientID: config.googleAuth.clientID
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log(profile);
    console.log('logged in successfully');
    done(null,profile);
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var sessionOpt = {
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {httpOnly: true, maxAge: 2419200000}
};


var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser(config.secret));
app.use(session(sessionOpt));
app.use(passport.initialize());
app.use(passport.session());


/* GOOGLE AUTH */
app.get('/api/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]}));

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/#/');
  });

var auth = function(req, res, next){
  if(!req.isAuthenticated()){
    res.status(401).send({error: 'unauthorized'});
  }else{
    next();
  }
};

app.get('/api/me', auth, function(req, res){
  return res.json(req.session.passport.user);
});


var server = app.listen(config.port, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app running at http://%s:%s', host, port);

});
