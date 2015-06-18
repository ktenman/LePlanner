// Material type schema

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var materialTypeSchema = new Schema({
  materialTypeSchema: {type: String}
});

module.exports = mongoose.model('MaterialType', materialTypeSchema);
