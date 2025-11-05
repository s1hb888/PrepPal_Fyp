const express = require("express");
const router = express.Router();
const ColorQuiz = require("../models/ColorQuiz");

// ✅ GET all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await ColorQuiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err });
  }
});

// ✅ GET a single quiz by ID (optional)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await ColorQuiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err });
  }
});

module.exports = router;
