const mongoose = require('mongoose');

// Option Schema (har option ke liye alag object banaya)
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },      // e.g. "ا"
  imageUrl: { type: String, default: null },   // agar Urdu/English me image ho
}, { _id: false });

// Question Schema
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },   // Question text
  options: [optionSchema],                      // Ab array of objects
  correctAnswer: { type: String, required: true }, // Yahan sirf option.text ka match hoga
  imageUrl:{type:String}
});

// Quiz Schema
const quizSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true }, // English, Urdu, Math, etc.
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);