const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  username: { type: String, required: true },
  medicineName: { type: String, required: true },
  email: { type: String, required: true },
  number: {type: Number, required: true},
  time: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
