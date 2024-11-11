// taskSchema.js
const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, default: Date.now },
  FitnessAndExercise: { type: [taskItemSchema], default: [] },
  DietAndNutrition: { type: [taskItemSchema], default: [] },
  MentalWellness: { type: [taskItemSchema], default: [] },
  SymptomManagement: { type: [taskItemSchema], default: [] },
  DiseaseManagement: { type: [taskItemSchema], default: [] },
  DailyRoutineSync: { type: [taskItemSchema], default: [] },
  HabitAdjustment: { type: [taskItemSchema], default: [] }
});

module.exports = mongoose.model('Task', taskSchema);
