var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    subscribers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
});

module.exports = mongoose.model('Scenario', ScenarioSchema);
