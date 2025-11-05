const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  word: { type: String, required: true },
  image_url: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: optionSchema, required: true },
  winner: { type: String, required: true },
});

const vegetableQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("VegetableQuiz", vegetableQuizSchema);
