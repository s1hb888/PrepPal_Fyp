// routes/quizFruit.js
const express = require("express");
const router = express.Router();
const FruitQuiz = require("../models/FruitQuiz");

// ✅ GET all fruit quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await FruitQuiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching fruit quizzes", error: err });
  }
});

// ✅ GET a single fruit quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const quiz = await FruitQuiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err });
  }
});

module.exports = router;
