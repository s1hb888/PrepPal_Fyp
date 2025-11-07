const mongoose = require("mongoose");

const hintSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  shapeName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  hints: [hintSchema]
});

const shapeQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema]
});

module.exports = mongoose.model("ShapeQuiz", shapeQuizSchema);
