const mongoose = require('mongoose');

const beliefSchema = new mongoose.Schema({
  question: String,
  answer: String,
});

module.exports = mongoose.model('Belief', beliefSchema);
