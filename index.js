var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

var app = express();

app.get('/api/hello', function(req, res){
  console.log('somebody visited /api/hello');
  res.json({hello:'hello'});

});

var server = app.listen(3000, function(){

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server app running at http://%s:%s', host, port);
});
