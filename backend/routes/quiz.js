const express = require('express');
const router = express.Router();
const generateQuiz = require('../utils/quizGenerator');
const Quiz = require('../models/Quiz'); // ✅ single model now

router.post('/generate', async (req, res) => {
  const { subject } = req.body;

  if (!subject) return res.status(400).json({ message: 'Subject is required' });

  try {
    const quizArray = await generateQuiz(subject);

    // ✅ Check if it's a valid array
    if (!Array.isArray(quizArray) || !quizArray.length) {
      return res.status(500).json({ message: 'Failed to parse quiz properly.' });
    }

    // ✅ Save the parsed quiz with subject
    const savedQuiz = await Quiz.create({ subject, questions: quizArray });

    res.status(201).json({
      message: `Quiz saved for ${subject}`,
      quizText: savedQuiz.questions, // 👈 frontend needs this
    });

  } catch (err) {
    console.error('❌ Quiz generation error:', err.message);
    res.status(500).json({ message: 'Quiz generation or save failed' });
  }
});

module.exports = router;
