const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const Performance = require('../models/Performance');
const NumberModel = require('../models/Number');
const UrduModel = require('../models/Urdu');
const AlphabetModel = require('../models/Alphabet');
const UserAccess = require('../models/UserAccess');
const router = express.Router();

// Map subject → model
const subjectModels = {
  Number: NumberModel,
  Urdu: UrduModel,
  Alphabet: AlphabetModel,
};

/**
 * GET /api/performance/summary
 * Summary by subject (already implemented)
 */
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Performance.find({ userId });

    if (!records.length) {
      return res.json({
        success: true,
        data: [],
        message: 'No performance data found.',
      });
    }

    const subjects = {};
    records.forEach((rec) => {
      if (!subjects[rec.subject]) {
        subjects[rec.subject] = {
          subject: rec.subject,
          totalAttempts: 0,
          totalCorrect: 0,
          avgAccuracy: 0,
          avgTimeSec: 0,
          totalWords: 0,
          completedWords: 0,
        };
      }

      const s = subjects[rec.subject];
      s.totalAttempts += rec.attempts;
      s.totalCorrect += rec.correct;
      s.avgAccuracy += rec.accuracy;
      s.avgTimeSec += rec.avgTimeSec;
      s.totalWords += 1;
      if (rec.done) s.completedWords += 1;
    });

    const summary = Object.values(subjects).map((s) => ({
      subject: s.subject,
      totalAttempts: s.totalAttempts,
      totalCorrect: s.totalCorrect,
      avgAccuracy: (s.avgAccuracy / s.totalWords).toFixed(1),
      avgTimeSec: (s.avgTimeSec / s.totalWords).toFixed(1),
      completionRate: ((s.completedWords / s.totalWords) * 100).toFixed(1),
      totalWords: s.totalWords,
      completedWords: s.completedWords,
    }));

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('Error fetching performance summary:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

/**
 * GET /api/performance/summary/:subject
 * Detailed report for one subject + passing criteria
 */router.get('/summary/:subject', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject } = req.params;
    const Model = subjectModels[subject];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject '${subject}'.`,
      });
    }

    // Fetch user’s performance records for the subject
    const records = await Performance.find({ userId, subject }).sort({ item: 1 });

    if (!records.length) {
      return res.json({
        success: true,
        data: [],
        message: `No performance records found for subject '${subject}'.`,
      });
    }

    // Fetch ALL items (e.g., words/numbers/alphabets) for that subject
    const itemsData = await Model.find({}, {
      [subject === 'Number' ? 'number' : 'alphabet']: 1,
      min_attempts: 1,
      min_time_avg: 1,
      min_correct_avg: 1,
    }).lean();

    // Fetch user-specific access limits
    const userAccess = await UserAccess.findOne({ user_id: userId });
    const accessSettings = subject === 'Alphabet'
      ? userAccess?.access?.alphabets || []
      : userAccess?.access?.numbers || [];

    // Build quick lookup by item text
    const keyField = subject === 'Number' ? 'number' : 'alphabet';
    const criteriaMap = {};
    itemsData.forEach((it) => {
      const userLimit = accessSettings.find(
        (a) => a.item_id?.toString() === it._id.toString()
      );

      criteriaMap[it[keyField]] = {
        min_attempts: userLimit?.min_attempts ?? it.min_attempts ?? 0,
        min_time_avg: userLimit?.min_time_avg ?? it.min_time_avg ?? 0,
        min_correct_avg: userLimit?.min_correct_avg ?? it.min_correct_avg ?? 0,
      };
    });

    // Merge performance + passing criteria
    const details = records.map((rec) => ({
      item: rec.item,
      attempts: rec.attempts,
      correct: rec.correct,
      accuracy: rec.accuracy,
      avgTimeSec: rec.avgTimeSec,
      done: rec.done,
      lastUpdated: rec.lastUpdated,
      passingCriteria: criteriaMap[rec.item] || {
        min_attempts: null,
        min_time_avg: null,
        min_correct_avg: null,
      },
    }));

    res.json({
      success: true,
      subject,
      totalWords: records.length,
      completedWords: records.filter((r) => r.done).length,
      data: details,
    });
  } catch (err) {
    console.error('Error fetching subject performance details:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});


module.exports = router;
