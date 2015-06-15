var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var getDate = new Date();
var month = getDate.getMonth()+1;
var currentDay = getDate.getDate() +'.'+month+'.'+ getDate.getFullYear();
var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    //  scenario author
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        name: { type: String, required: true}
    },
    //  date of creation
    created: { type: Date, default: Date.now},
    //  Number of students
    students: { type: Number, default: 0},
    //  language
    language: { type: String},
    //  license
    license: { type: String},
    //  Technical resources
    techRes: { type: String},
    //  Study material type
    materialType: { type: String},
    //  method
    method: { type: String},

    //  scenario description
    description: { type: String, required: false},

    subscribers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    deleted: {type: Boolean, required: true, default: false}
});
var scenario = mongoose.model('Scenario', ScenarioSchema);
scenario.aggregate({$project: { day: {$dayOfMonth: '$created'}}});
module.exports = scenario;
