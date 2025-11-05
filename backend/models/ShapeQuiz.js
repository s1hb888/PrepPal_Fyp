import mongoose from "mongoose";

const hintSchema = new mongoose.Schema({
  text: String,
});

const questionSchema = new mongoose.Schema({
  shapeName: String, // Correct Answer
  hints: [hintSchema], // Two hints
});

const shapeQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

export default mongoose.model("ShapeQuiz", shapeQuizSchema);
