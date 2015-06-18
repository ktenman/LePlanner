// Stage schema

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var StageSchema = new Schema({
  stage: { type: String}
});

module.exports = mongoose.model('Stage', StageSchema);
