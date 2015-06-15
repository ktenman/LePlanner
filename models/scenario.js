var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    //  scenario author
    author: { 
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        name: { type: String, required: true}
    },
    //  date of creation
    created: { type: Date, default: Date.now },
    //  scenario description
    description: { type: String, required: false},
    
    subscribers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    deleted: {type: Boolean, required: true, default: false}
});

module.exports = mongoose.model('Scenario', ScenarioSchema);
