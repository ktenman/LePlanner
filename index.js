var config = require('./config/config');

var express = require('express');


/* DATABASE */
var mongoose = require('mongoose');
mongoose.connect(config.db, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, db.error));

var User = require('./models/user');
var Scenario = require('./models/scenario');

var passport = require('passport');


var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    callbackURL: config.googleAuth.callbackURL,
    realm: config.realm,
    clientSecret: config.googleAuth.clientSecret,
    clientID: config.googleAuth.clientID
  },
  function(accessToken, refreshToken, profile, done) {
  //  console.log(profile);

    var google_id = profile.id;
    var last_name = profile.name.familyName;
    var first_name = profile.name.givenName;
    var email = profile.emails[0].value;

    User.findOne({ google: {id: google_id }}, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        console.log('Creating new user');
        var new_user = new User({
          first_name: first_name,
          last_name: last_name,
          email: email,
          google: {
            id: google_id
          }
        });

        new_user.save(function(err, user){
          if(err){ return done(err); }

          console.log('created new user with id: '+user._id);
          done(null, user);
        });



      }else{
        console.log('existing user with id: '+user._id);
        done(null, user);
      }

    });

  }
));

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var sessionOpts = {
  saveUninitialized: true, // saved new sessions
  resave: false, // do not automatically write to the session store
  secret: config.secret,
  cookie : { httpOnly: true, maxAge: 2419200000 } // configure when sessions expires
};

var app = express();
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser(config.secret));
app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log('teeb bitideks');
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log('tagastab user-i');
    done(err, user);
  });
});

// Define a middleware function to be used for every secured routes
var auth = function(req, res, next){
  //console.log(req.session);
  if (!req.isAuthenticated())
    res.status(401).send({error: 'unauthorized'});
  else
    next();
};


//Other routes
app.get('/api/loggedin', auth, function(req, res) {
  console.log(req.user);
  console.log(req.session.passport.user);

  res.send('hello world ');
  //{ user: req.user }
});

app.get('/api/me', auth, function(req, res) {
  console.log('/api/me', req.session.passport.user);
  User.findById(req.session.passport.user, function (err, user){
    if (err) return res.json({error: err});
    if (!user) return res.json({error: 'not logged in'});

    return res.json(user);

  });
  //console.log(req.user);
  //console.log(req.session.passport.user);

});

// route to log out
app.get('/api/logout', function(req, res){
  console.log('logout');
  req.logOut();
  res.send(200);
});

app.get('/api/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}),
  function(req, res) {
    //res.json({success: 'Login succesfull'});

});

app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/#/login'}),
  function(req, res) {

    console.log('Successful login');


    res.redirect('/#/');
  });

  app.get('/api/scenarios', function(req, res, next) {
    var query = Scenario.find();
    if (req.query.subject) {
      query.where({ subject: req.query.subject });
    } else {
      query.limit(12);
    }
    query.exec(function(err, scenarios) {
      if (err) return next(err);
      res.send(scenarios);
    });
  });

  app.get('/api/scenarios/:id', function(req, res, next) {
    Scenario.findById(req.params.id, function(err, scenario) {
      if (err) return next(err);
      res.send(scenario);
    });
  });

  app.post('/api/savescenario', auth, function(req, res, next) {
    var scenariodata = req.body;
    console.log(scenariodata);

    var scenario = new Scenario(scenariodata);

    scenario.save(function(err, s){
      if(err){ return next(err); }

      console.log('saved sceanrio '+s._id);
      res.sendStatus(200);
    });
  });

  app.post('/api/subscribe', auth, function(req, res, next) {
    Scenario.findById(req.body.scenarioId, function(err, scenario) {
      if (err) return next(err);
      scenario.subscribers.push(req.user._id);
      scenario.save(function(err) {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  app.post('/api/unsubscribe', auth, function(req, res, next) {
    Scenario.findById(req.body.scenarioId, function(err, scenario) {
      if (err) return next(err);
      var index = scenario.subscribers.indexOf(req.user._id);
      scenario.subscribers.splice(index, 1);
      scenario.save(function(err) {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });


var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
