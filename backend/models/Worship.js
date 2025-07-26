const mongoose = require('mongoose');

const worshipSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

module.exports = mongoose.model('Worship', worshipSchema);
