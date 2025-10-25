// routes/result.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Quiz = require("../models/Quiz");

// Save quiz result
router.post("/save", verifyToken, async (req, res) => {
  try {
    const { quizId, score, total, answers } = req.body;
    if (!quizId || score == null || total == null) {
      return res.status(400).json({ message: "quizId, score and total are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    // ✅ Map user answers into questions
    quiz.questions = quiz.questions.map((q) => {
      // Find corresponding answer
      const ans = answers.find((a) => a.question === q.question);

      if (ans) {
        return {
          ...q.toObject(), // keep original question & options
          selected: ans.selected ?? null,
          isCorrect: ans.isCorrect ?? false,
          timeTaken: ans.timeTaken ?? 0,
        };
      }
      return q; // no answer, keep original
    });

    // Save quiz summary
    quiz.score = score;
    quiz.total = total;
    quiz.finishedAt = new Date();

    await quiz.save();

    res.status(201).json({
      message: "Result saved successfully",
      quizId: quiz._id,
    });
  } catch (err) {
    console.error("❌ Save result error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
