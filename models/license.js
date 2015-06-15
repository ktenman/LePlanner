var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LicenseSchema = new Schema({
  licenseType: {type: String}
});

module.exports = mongoose.model('License', LicenseSchema);
