var config = require('./config/config');

var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var moment = require('moment');

mongoose.connect(config.db, function(err){
  if(err) throw err;
  console.log('successfully connected to Mongo db');
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, db.error));

//  variables for database table connection
var User = require('./models/user');
var Scenario = require('./models/scenario');
var Language = require('./models/language');
var License = require('./models/license');
var MaterialType = require('./models/materialType');
var Method = require('./models/method');
var Stage = require('./models/stage');
var Technical = require('./models/technical');

//  Google login function
//  If it cant find the user, it will make a new one
//  if it does find it then gets the data from database
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
        image: profile._json.image.url.replace("?sz=50","")
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

//  session settings
var sessionOpt = {
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {httpOnly: true, maxAge: 2419200000}
};


var app = express();
// logging for developing
app.use(morgan('dev'));

//  functions that Express needs to use for proper functionality
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser(config.secret));
app.use(session(sessionOpt));
app.use(passport.initialize());
app.use(passport.session());

//  google server side function that runs when on certain page
app.get('/api/auth/google',
  passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]}));

//  google server side function that runs when on certain page
//  if authentication is successful then redirects
app.get('/api/oauth2callback',
  passport.authenticate('google', { failureRedirect: '/#/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/#/');
  });

//  function that checks if the user is logged in or not
//  only logged in users can continue
var auth = function(req, res, next){
  if(!req.isAuthenticated()){
    res.status(401).send({error: 'unauthorized'});
  }else{
    next();
  }
};

//   server side function that returns object with User data inside(first_name, last_nae, etc)
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

//  logs out the user on server side
app.get('/api/logout', auth, function(req, res){
  console.log('logged out');
  req.logOut();
  res.status(200).send({success: 'success'});
  //res.redirect('/#/');
});

//  Scenarios search/return function - Home.html
//  retuns certain object that includes all scenarios from databse or
//  specific schenarios that match criterions
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
    }
    query.exec(function(err, scenarios) { //  executes the query(show all on the page or show what was searched)
      if (err) return next(err);
      res.send(scenarios);
    });

  });

//  Specific scenario data function - details.html
//  returns specifig scenario data from database by id on the URL
  app.get('/api/scenarios/:id', function(req, res, next) {
    Scenario.findById(req.params.id, function(err, scenario) {
      if (err) return next(err);
      if (scenario.created) {
        console.log("\nUSER JUST OPENED SCENARIO, WHICH WAS CREATED: "+scenario.created+"\n");
      }
      res.send(scenario);
    });
  });

//  Specific user data function - profile.html
//  returns specifig user data from database by id on the URL
  app.get('/api/profile/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, profile) {
      if (err) return next(err);
      res.send(profile);
    });
  });

  //  Scenario editing function - edit.html
  //  returns specifig scenario data from database by id on the URL
  //  so it can be edited
  app.get('/api/edit/:id', function(req, res, next){
      Scenario.findById(req.params.id, function(err, scenario) {
        if(err) return next(err);
        res.send(scenario);
      });
  });

  //  Scenario deleting function - details.html
  //  changes the schenario Deleted value to True on specific scenario
  //  id of the scenario is sent to the page and accessed as req.body.scenarioId
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

  //  Scenario updateing function - edit.html
  //  updates specific scenario with new values that are sent to the page
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

  //  Scenario updateing function - edit.html
  //  updates specific scenario with new values that are sent to the page
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

//  Scenario subscribing function - details.html
//  allows to Users to subscribe to scenario
//  lists users id to scenario subrscribers array
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

  //  Scenario unsubscribing function - details.html
  //  allows to Users to unsubscribe from scenario
  //  removes users id from array
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

//  server settings
var server = app.listen(config.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

//  SEARCH page function
//  shows all or 12 results if there are no criterions
//  returns scenarios based on criterion or criterions chosen
app.get('/api/search', function(req, res, next) {
  var query = Scenario.find();
  //console.log(req.query);
  var searchAPI = { };
  var searchArray = []; //  array that will be used to search multiple criterions

  var escapeRegExp = function escapeRegExp(str){
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // replaces special chars
  };


  if(req.query.name || req.query.subject || req.query.method || req.query.stage){
    if(req.query.name){
      var regex = new RegExp('(?=.*'+ escapeRegExp(req.query.name).split(' ').join(')(?=.*') + ')', 'i'); //  sets req.query.name so that we can search similar names
      searchArray.push({name: regex});
    }
    if(req.query.subject){
      if(typeof req.query.subject == 'string'){ //  check if subject is array or string
        searchArray.push({subject: req.query.subject});
      }else {
        searchArray.push({subject: { $in : req.query.subject }});
      }
    }
    if(req.query.method){
      searchArray.push({method: req.query.method});
      }
    if(req.query.stage){
      searchArray.push({stage: req.query.stage});
    }
    searchAPI.$and = searchArray; //  gives $and the array that will be used to search by multiple criterions
    query.where(searchAPI); //  searches all scerions that match the criterions inside the objecr(searchAPI)
  }
  else
  {
    query.where({ deleted: false });  //  if you are not searching anything it will show all results or only 12 if too many
    query.limit(12);
  }
  query.exec(function(err, scenarios){
    if (err) return next(err);
    res.send(scenarios);  //  returns found results
  });
});
