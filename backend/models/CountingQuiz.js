const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  images: [], // 3 image URLs
  answer: { type: String, required: true }, // correct answer
});

const countingQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("CountingQuiz", countingQuizSchema);
