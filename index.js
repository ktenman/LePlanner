var config = require('./config/config');

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');

mongoose.connect(config.db, function(err){
  if(err) throw err;
  console.log('successfully connected to Mongo db');
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, db.error));

var User = require('./models/user');
var Scenario = require('./models/scenario');
var Language = require('./models/language');
var License = require('./models/license');
var MaterialType = require('./models/materialType');
var Method = require('./models/method');
var Stage = require('./models/stage');
var Technical = require('./models/technical');


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
  User.findById(id, function(err, user, res){
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
// logging for developing
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser(config.secret));
app.use(session(sessionOpt));
app.use(passport.initialize());
app.use(passport.session());


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


  app.get('/api/scenarios', function(req, res, next) {

    var query = Scenario.find();
    if (req.query.subject) {
      query.where({ subject: req.query.subject, deleted: false });
    } else if(req.query.name){  //IF SCENARIO NAME IS SEND ON HOME PAGE TO THE SEARCH BOX
      var escapeRegExp = function escapeRegExp(str){
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // replaces special chars
      };
      var regex = new RegExp('(?=.*'+ escapeRegExp(req.query.name).split(' ').join(')(?=.*') + ')', 'i'); //  sets req.query.name so that we can search similar names

      query.where({ name: regex, deleted: false}); //  find all where name is similar to regex and deleted is false
    }else {
      query.where({ deleted: false });  //  if you are not searching anything it will show all results or only 12 if too many
      query.limit(12);
    }
    query.exec(function(err, scenarios) { //  executes the query(show all on the page or show what was searched)
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

  //  Scenario editing
  app.get('/api/edit/:id', function(req, res, next){
      Scenario.findById(req.params.id, function(err, scenario) {
        if(err) return next(err);
        res.send(scenario);
      });
  });

  //  Scenario deleting
  app.post('/api/deletescenario', function(req, res, next) {
    Scenario.findById(req.body.scenarioId, function(err, scenario) {  //  get the scenario by id
      console.log(req.body.scenarioId); //  for developement, prints the id to web console
      scenario.deleted = true;  // sets the deleted value to true
      scenario.save(function(err) { //  saves the scenario
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  //  Scenario updateing
  app.post('/api/updatescenario', function(req, res, next){ //  req is the scenario object sent from controllers.js
    Scenario.findById(req.body.id, function(err, scenario) {  //  get the scenario by id
      console.log(req.body.id); //  for developement, prints the id to web console
      scenario.name = req.body.name;  //  sets the scenario name to new name
      scenario.subject = req.body.subject;  // sets the scenario subject to new subject
      scenario.description = req.body.description;  // sets the scenario description to new description
      scenario.save(function(err) { //  saves the scenario
        if(err) return next(err);
        console.log('UPDATED '+req.body.id);
        res.sendStatus(200);
      });
    });
  });

  app.post('/api/savescenario', auth, function(req, res, next) {
    var scenariodata = req.body;
    console.log(scenariodata);

    var scenario = new Scenario(scenariodata);

    scenario.save(function(err, s){
      if(err){ return next(err); }

      console.log('saved scenario '+s._id);
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

//  SEARCH
app.get('/api/search', function(req, res, next) {
  var query = Scenario.find();

  if(req.query.name)
  {  // if scenario name is sent to the Scenario.query (controllers.js)
    var escapeRegExp = function escapeRegExp(str){
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // replaces special chars
    };
    var regex = new RegExp('(?=.*'+ escapeRegExp(req.query.name).split(' ').join(')(?=.*') + ')', 'i'); //  sets req.query.name so that we can search similar names

    if(req.query.subject){
      query.where({ $and : [{ name: regex}, {deleted: false}, {subject: { $in: req.query.subject }}] });  //  find all where name is similar to regex and deleted is false
      console.log(req.query.name);
      console.log(req.query.subject);
    }else{
      query.where({ name: regex, deleted: false});  //  find all where name is similar to regex and deleted is false
      console.log(req.query.name);
    }
    //query.where({ name: regex, deleted: false});  //  find all where name is similar to regex and deleted is false
  }
  else if(!req.query.name && req.query.subject)
  {
    if(typeof req.query.subject == 'string'){
      query.where({ $and : [{deleted: false}, {subject: req.query.subject }] });  //  find all where name is similar to regex and deleted is false
      console.log(req.query.subject);
    }else {
      query.where({ $and : [{deleted: false}, {subject: { $in : req.query.subject } }] });  //  find all where name is similar to regex and deleted is false
      console.log(req.query.subject);
    }

  }
  else
  {
    query.where({ deleted: false });  //  if you are not searching anything it will show all results or only 12 if too many
    query.limit(12);
  }

  query.exec(function(err, scenarios){
    if (err) return next(err);
    res.send(scenarios);
  });
});
