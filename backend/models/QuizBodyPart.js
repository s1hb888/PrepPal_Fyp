// models/QuizBodyPart.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  image_url: { type: String, required: true },
  answer: { type: String, required: true },
});

const quizBodyPartSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("QuizBodyPart", quizBodyPartSchema);
