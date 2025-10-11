const mongoose = require("mongoose");

/* ---------- Option Schema ---------- */
const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // option text
    imageUrl: { type: String, default: null }, // agar option ke saath image ho
  },
  { _id: false }
);

/* ---------- Question Schema ---------- */
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true }, // question text
  options: [optionSchema], // options array
  correctAnswer: { type: String, required: true }, // correct option.text
  imageUrl: { type: String, default: null }, // question ke liye image

  // 👇 User response fields (per attempt)
  selected: { type: String, default: null },
  isCorrect: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 }, // seconds taken
});

/* ---------- Quiz Schema ---------- */
const quizSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    questions: [questionSchema], // questions ke andar hi user response save
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // quiz creator

    // 👇 optional: summary of attempts / score
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
