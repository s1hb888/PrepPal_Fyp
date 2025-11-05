const express = require("express");
const VegetableQuiz = require("../models/VegetableQuiz");

const router = express.Router();

// GET all vegetable quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await VegetableQuiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err });
  }
});

// GET single quiz by ID (optional)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await VegetableQuiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err });
  }
});

module.exports = router;
