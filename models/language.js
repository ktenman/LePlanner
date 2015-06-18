// Language schema

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LanguageSchema = new Schema({
  lang: { type: String}
});
module.exports = mongoose.model('Language', LanguageSchema);
