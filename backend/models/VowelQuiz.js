// models/VowelQuiz.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  correct_answer: { type: String, required: true },
});

const vowelQuizSchema = new mongoose.Schema({
  quiz_title: { type: String, required: true },
  questions: [questionSchema],
});

export default mongoose.model("VowelQuiz", vowelQuizSchema);
