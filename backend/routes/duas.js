const express = require('express');
const router = express.Router();
const path = require('path');
const Dua = require('../models/Dua');

// ✅ Load static JSON file for seeding
const duasData = require(path.join(__dirname, '../JsonCollections/duas.json'));

// ✅ Fetch Duas - If DB is empty, seed from JSON
router.get('/', async (req, res) => {
  try {
    let duas = await Dua.find();

    if (!duas || duas.length === 0) {
      console.log('⚠ No duas found in DB. Seeding from JSON...');
      await Dua.insertMany(duasData);
      duas = await Dua.find(); // Fetch again after insertion
    }

    res.json(duas);
  } catch (err) {
    console.error('❌ Error fetching duas:', err);
    res.status(500).json({ error: 'Failed to load duas' });
  }
});

module.exports = router;

