const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image_url: { type: String, required: true },
  correct_answer: { type: String, required: true },
});

const vowelQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("VowelQuiz", vowelQuizSchema);
