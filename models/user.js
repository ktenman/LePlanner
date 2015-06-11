var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    created: { type: Date, default: Date.now },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    google: {
        id: String,
        token: String,
        email: String,
        name : String
    }
});

module.exports = mongoose.model('User', UserSchema);
