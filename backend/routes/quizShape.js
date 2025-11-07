const express = require("express");
const router = express.Router();
const ShapeQuiz = require("../models/ShapeQuiz");

// GET all quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await ShapeQuiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err });
  }
});

module.exports = router;
