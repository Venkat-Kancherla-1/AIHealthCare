const mongoose = require('mongoose');

const InfoSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  completed: { type: Number, required: true},
  age: {type: Number, required: true},
  height: {type: Number, required: true},
  gender: {type: String},
  weight: {type: Number, required: true},
  medicalConditions: {type: String, required: true},
  allergies : {type: String, required: true},
  pregnant: {type: Boolean, required: true},
  wakeup: {type:String, required: true},
  sleep: {type:String, required: true},
  smoke: {type:Boolean, required: true},
  drinks: {type:Boolean, required: true},
  diet: {type:String, required: true},
  foodTOAvoid: {type:String, required: true},
  physicalLimitations: {type:String, required: true},
  fitnessGoal: {type:String, required: true},
});

module.exports = mongoose.model('Info', InfoSchema);
