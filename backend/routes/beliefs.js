const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Belief = require('../models/Belief');

const beliefsFilePath = path.join(__dirname, '../JsonCollections/basicIdentityBeliefs.json');

router.get('/', async (req, res) => {
  try {
    let questions = await Belief.find();

    if (!questions || questions.length === 0) {
      const fileData = fs.readFileSync(beliefsFilePath, 'utf8');
      const beliefData = JSON.parse(fileData);

      await Belief.insertMany(beliefData);
      questions = await Belief.find();
    }

    res.json(questions);
  } catch (err) {
    console.error('❌ Error loading beliefs:', err);
    res.status(500).json({ error: 'Failed to load beliefs' });
  }
});

module.exports = router;

