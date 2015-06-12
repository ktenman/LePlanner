var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubjectsSchema = new Schema({
    name: { type: String, required: true },
    deleted: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('Subject', SubjectsSchema);
