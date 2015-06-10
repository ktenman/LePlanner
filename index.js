var config = require('./config/config');

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.connect(config.db, function(err){
  if(err) throw err;
  console.log('successfully connected to Mongo db');
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, db.error));

var User = require('./models/user');
var Scenario = require('./models/scenario');

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

    var new_user = new User({
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      email: profile.emails[0].value,
      google: {
        id: profile.id,
        email: profile.emails[0].value,
      }
    });

    User.findOne({ email: new_user.email }, function(err, user){
      if(err) {return done(err); }
      if(!user){

        new_user.save(function(err,user){
          if(err) {return done(err); }

          console.log('created new user with id: '+user._id);
          done(null,user);
        });

      }else{
        console.log('got user from db with id: '+user._id);
        done(null,user);

      }

    });


  }
));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    if(err) {return res.json({error: err}); }
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


/* GOOGLE AUTH */
app.get('/api/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]}));

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/#/login' }),
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
  //req.session.passport.user = [serializeUser ==> user.id ]
  User.findById(req.session.passport.user, function(err, user){
    if(err) {return res.json({error: err}); }
    if(user){
      return res.json(user);
    }else{
      return res.json({error: "not logged in"});
    }

  });

});

app.get('/api/logout', auth, function(req, res){
  console.log('logged out');
  req.logOut();
  res.status(200).send({success: 'success'});
  //res.redirect('/#/');
});


app.post('/api/savescenario', auth, function(req, res, next){

  var scenariodata = req.body;

  var scenario = new Scenario(scenariodata);

  scenario.save(function(err,user){
    if(err) {return done(err); }
    console.log('scenario saved');
    res.status(200);
  });

  //res.redirect('/#/');
});



var server = app.listen(config.port, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app running at http://%s:%s', host, port);

});
