const express = require("express");
const router = express.Router();
const VowelQuiz = require("../models/VowelQuiz");

// GET all vowel quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await VowelQuiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err });
  }
});

// GET single quiz by ID (optional)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await VowelQuiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err });
  }
});

module.exports = router;
