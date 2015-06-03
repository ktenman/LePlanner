// server
var config = require('./config/config');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


//GOOGLE AUTH https://github.com/jaredhanson/passport-google-oauth
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
  callbackURL: config.googleAuth.callbackURL,
  ralm: config.realm,
  clientSecret: config.googleAuth.clientSecret,
  clientID: config.googleAuth.clientID
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);

    done(null,profile);
  }
));

//google auth lõpp

var sessionOpt = {
  secret: config.secret,
  resave: false,
  saveUnitialized: true,
  cookie:{httpOnly:true, maxAge: 2419200000}
};

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlexcoded({extended:true}));
app.use(cookieParser(config.secret));
app.use(session(sessionOpt));
app.use(passport.initialize());
app.use(passport.session());

//mis juhtub, kui keegi tuleb
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email']}));

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//'mis juhtub' lõpp

app.get('/api/me', function(req, res){
  
});

var server = app.listen(3000, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Sever app running at http://%s:%s', host, port);
});
