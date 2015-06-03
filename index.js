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

app.get('/api/hello', function(req, res){
  console.log('somebody visited /api/hello');
  res.json({hello:'hello'});
});

var server = app.listen(config.port, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app running at http://%s:%s', host, port);

});
