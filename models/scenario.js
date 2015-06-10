var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ScenarioSchema = new Schema({
  name: {type: String, required:true},
  category: {type: String, required:true}
});

module.expots = mongoose.model('Scenario', ScenarioSchema);
