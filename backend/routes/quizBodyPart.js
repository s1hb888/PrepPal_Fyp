// routes/quizBodyPart.js
const express = require("express");
const router = express.Router();
const QuizBodyPart = require("../models/QuizBodyPart");

// ✅ Route 1: Get all quiz titles
router.get("/", async (req, res) => {
  try {
    // Fetch only quiz titles (not all questions)
    const quizzes = await QuizBodyPart.find({}, "quiz_title");
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Route 2: Get full quiz by ID (with questions)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await QuizBodyPart.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
