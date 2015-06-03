var config = require('./config/config');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({

    callbackURL: config.googleAuth.callbackURL,
    realm: config.realm,
    clientSecret: config.googleAuth.clientSecret,
    clientID: config.googleAuth.clientID
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
  }
));

var app = express();

/* GOOGLE AUTH */
app.get('/api/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
    ] }));

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/#/');
  });

var server = app.listen(config.port, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app running at http://%s:%s', host, port);
});
