var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LicenseSchema = new Schema({
  licenseType: {type: String}
});
