var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MethodSchema = new Schema({
  method: { type: String}
});

module.exports = mongoose.model('Method', MethodSchema);
