// aka Server.js
var config = require('./config/config');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


// Database connection
mongoose.connect(config.db, function(err) {
  if(err) throw err;
  console.log('Successfully connected to MongoDB');
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, db.error));

var User = require('./models/user');

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// Facebook Authentication
passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
  },
  function(accessToken, refreshToken, profile, done){
    console.log(profile);
    done(null, profile);
  }
));

// Google Authentication
passport.use(new GoogleStrategy({

    callbackURL: config.googleAuth.callbackURL,
    realm: config.realm,
    clientSecret: config.googleAuth.clientSecret,
    clientID: config.googleAuth.clientID
  },
  function(accesstoken, refreshToken, profile, done) {
    //console.log(profile);
    console.log('Logged in successfully');
    console.log(profile.emails);

    var new_user = new User({
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        email: profile.emails[0].value,
        google: {
          id: profile.id,
          email: profile.emails[0].value
        }
    });

    User.findOne({email: new_user.email}, function(err, user) {
      if(err) {return done(err);}

      if(!user) {
        if(err) {return done(err);}
          new_user.save(function(err, user) {
            console.log('Created new user with id: ' + user._id);
            done(null, user);
          });
      }
      else {
        console.log(user);
        console.log('Got User from db with id ' + user._id);
        done(null, user);
      }

    });
  }

));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if(err) {return res.json({error: err});}
      done(err, user);
    });
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

// FaceBook Authentication
app.get('/api/auth/facebook',
  passport.authenticate('facebook', function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  }));

app.get('/api/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/#/login'}),
  function(req, res){
    res.redirect('/#/');
  });

// Google Authentication
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/#/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/#/');
  });

var auth = function(req, res, next){
  if(!req.isAuthenticated()){
    res.status(401).send({error:'Unauthorized'});
  }else{
    next();
  }
};

app.get('/api/me', auth, function(req, res){
  User.findById(req.session.passport.user, function(err, user){
    if(err) {return res.json({error: err});}

    if(user){
      return res.json(user);
    }
    else{
      return res.json({error: 'Not logged in'});
    }
  });
});

app.get('/api/logout', auth, function(req, res){
  console.log('logged out');
  req.logout();
  //res.status(200).send({success: 'success'});
  res.redirect('/#/');
});

var server = app.listen(config.port, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Server app running at http://%s:%s', host, port);
});
