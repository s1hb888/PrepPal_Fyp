const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../utils/quizGenerator');
const Quiz = require('../models/Quiz');
const verifyToken = require('../middleware/authMiddleware'); // ✅ your middleware

// Generate quiz (only logged-in users can access)
router.post('/generate', verifyToken, async (req, res) => {
  const { subject } = req.body;

  if (!subject) return res.status(400).json({ message: 'Subject is required' });

  try {
    const quizArray = await generateQuiz(subject);

    if (!Array.isArray(quizArray) || !quizArray.length) {
      return res.status(500).json({ message: 'Failed to parse quiz properly.' });
    }

    // ✅ Save quiz with logged-in userId from token
    const savedQuiz = await Quiz.create({
      subject,
      questions: quizArray,
      userId: req.user.id, // 👈 added from decoded token
    });

    res.status(201).json({
      message: `Quiz saved for ${subject}`,
      quizText: savedQuiz.questions,
      quizId: savedQuiz._id,
      userId: req.user.id, // return for frontend confirmation
    });

  } catch (err) {
    console.error('❌ Quiz generation error:', err.message);
    res.status(500).json({ message: 'Quiz generation or save failed' });
  }
});

module.exports = router;
