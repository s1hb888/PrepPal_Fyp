const express = require('express'); 
const router = express.Router();
const path = require('path');
const fs = require('fs');
const BasicQuestion = require('../models/BasicQuestion');

const basicQuestionsFilePath = path.join(__dirname, '../JsonCollections/basicQuestions.json');

router.get('/', async (req, res) => {
  try {
    let questions = await BasicQuestion.find();

    if (!questions || questions.length === 0) {
      const fileData = fs.readFileSync(basicQuestionsFilePath, 'utf8');
      const basicData = JSON.parse(fileData);

      await BasicQuestion.insertMany(basicData);
      questions = await BasicQuestion.find();
    }

    res.json(questions);
  } catch (err) {
    console.error('❌ Error loading basic questions:', err);
    res.status(500).json({ error: 'Failed to load basic questions' });
  }
});

module.exports = router;
