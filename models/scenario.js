var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    author: { type: [mongoose.Schema.Types.ObjectId], ref: 'User'},
    created: { type: Date, default: Date.now },
    description: { type: String, required: true},
    subscribers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    deleted: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('Scenario', ScenarioSchema);
