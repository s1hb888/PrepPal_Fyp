const express = require('express');
const router = express.Router();
const vowels = require('../JsonCollections/vowels.json');
const vowelSchema = require('../models/Vowel');

router.get('/', (req, res) => {
  const isValid = vowels.every(vowel => {
    const { error } = vowelSchema.validate(vowel);
    return !error;
  });

  if (!isValid) {
    return res.status(500).json({ message: 'Invalid data format in vowels.json' });
  }
  res.status(200).json(vowels);
});

module.exports = router;
