// Technical schema

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TechnicalSchema = new Schema({
  tech: { type: String}
});

module.exports = mongoose.model('Technical', TechnicalSchema);
