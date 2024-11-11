const mongoose = require('mongoose');

const chatSummarySchema = new mongoose.Schema({
  username: String,
  date: Date,
  symptoms: [String],
  diseases: [String]
});

module.exports = mongoose.model('ChatSummary', chatSummarySchema);
