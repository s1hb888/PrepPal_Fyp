const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  word: String,
  image_url: String,
  sound_text: String,
});

const questionSchema = new mongoose.Schema({
  question: String,
  options: [optionSchema],
  winner: String,
});

const fruitQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("FruitQuiz", fruitQuizSchema);
