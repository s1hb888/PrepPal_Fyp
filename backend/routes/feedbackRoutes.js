const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const verifyToken = require('../middleware/authMiddleware'); // JWT middleware

// ✅ Submit App Feedback
router.post('/', verifyToken, async (req, res) => {
  const {
    appEaseOfUse,
    performanceRating,
    designSatisfaction,
    featureUsefulness,
    bugOrIssueExperience,
    suggestions,
  } = req.body;

  const email = req.user.email;

  // 🔍 Validation for required ratings
  if (
    !appEaseOfUse ||
    !performanceRating ||
    !designSatisfaction ||
    !featureUsefulness
  ) {
    return res.status(400).json({
      message:
        'All rating fields (Ease of Use, Performance, Design, and Usefulness) are required.',
    });
  }

  // 🔍 Suggestions and bug report length validation
  if (suggestions && suggestions.length > 500) {
    return res.status(400).json({
      message: 'Suggestions cannot exceed 500 characters.',
    });
  }

  if (bugOrIssueExperience && bugOrIssueExperience.length > 300) {
    return res.status(400).json({
      message: 'Bug/Issue description cannot exceed 300 characters.',
    });
  }

  try {
    const feedback = new Feedback({
      email,
      appEaseOfUse,
      performanceRating,
      designSatisfaction,
      featureUsefulness,
      bugOrIssueExperience: bugOrIssueExperience || '',
      suggestions: suggestions || '',
    });

    const savedFeedback = await feedback.save();

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: savedFeedback,
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res
      .status(500)
      .json({ message: 'Server error, please try again later.' });
  }
});

// ✅ Get All Feedbacks (admin view)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ dateOfFeedback: -1 });
    return res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
