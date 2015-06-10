var mongoose = require('mongoose'),
  Schema = mongoose.Schema; //andmebaasi tabeli layout

var UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, index: {unique: true} },
  created: { type: Date, default: Date.now },
  google: {
    id: String,
    email: String
  }
});

module.exports = mongoose.model('User', UserSchema);
