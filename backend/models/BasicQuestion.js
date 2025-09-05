const mongoose = require('mongoose');

const BasicQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

module.exports = mongoose.model('BasicQuestion', BasicQuestionSchema);
