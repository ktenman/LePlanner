var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CommentSchema = new Schema({
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	// Scenario
	scenario: {
		type: Schema.Types.ObjectId,
		ref: 'Scenario'
	},
	comment: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	deleted: {
		type: Boolean,
		required: true,
		default: false
	}
});
module.exports = mongoose.model('Comment', CommentSchema);
