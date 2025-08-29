const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const verifyToken = require('../middleware/authMiddleware'); // JWT middleware

router.post('/', verifyToken, async (req, res) => {
  const { course, rating, difficulty, suggestions } = req.body;
  const email = req.user.email;

  if (!course || !rating || !difficulty) {
    return res.status(400).json({ message: 'Course, rating, and difficulty are required.' });
  }

  if (suggestions && suggestions.length > 500) {
    return res.status(400).json({ message: 'Suggestions cannot exceed 500 characters.' });
  }

  try {
    const feedback = new Feedback({ email, course, rating, difficulty, suggestions: suggestions || '' });
    const savedFeedback = await feedback.save();
    return res.status(201).json({ message: 'Feedback submitted successfully', feedback: savedFeedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ dateOfRating: -1 });
    return res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
