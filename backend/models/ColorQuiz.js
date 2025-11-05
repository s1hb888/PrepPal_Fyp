const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },      // Example: "What is the color of mango?"
  image_url: { type: String, required: true },     // One image URL only
  correct_answer: { type: String, required: true } // Example: "Yellow"
});

const colorQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

module.exports = mongoose.model("ColorQuiz", colorQuizSchema);
