const express = require('express');
const router = express.Router();
const path = require('path');
const Worship = require('../models/Worship'); // ✅ Your Mongoose model

const worshipData = require(path.join(__dirname, '../JsonCollections/Worship.json'));

// ✅ GET /api/worship
router.get('/', async (req, res) => {
  try {
    let questions = await Worship.find();

    if (!questions || questions.length === 0) {
      await Worship.insertMany(worshipData);
      questions = await Worship.find(); 
    }

    res.json(questions);
  } catch (err) {
    console.error('❌ Error fetching worship questions:', err);
    res.status(500).json({ error: 'Failed to load worship questions' });
  }
});

module.exports = router;
