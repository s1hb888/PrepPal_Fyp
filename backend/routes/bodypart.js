const express = require('express');
const router = express.Router();
const BodyPart = require('../models/BodyPart'); // Make sure the filename is Bodypart.js (capital P)

// @route   GET /api/bodypart
// @desc    Get all body parts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const parts = await BodyPart.find();
    res.json(parts);
  } catch (error) {
    console.error('Error fetching body parts:', error);
    res.status(500).json({ error: 'Failed to fetch body parts' });
  }
});

module.exports = router;
