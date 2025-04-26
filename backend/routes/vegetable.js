// routes/vegetable.js

const express = require('express');
const router = express.Router();
const Vegetable = require('../models/Vegetable');

// Get all vegetables
router.get('/', async (req, res) => {
  try {
    const vegetables = await Vegetable.find();
    res.json(vegetables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: Add new vegetable
router.post('/', async (req, res) => {
  try {
    const newVegetable = new Vegetable({
      word: req.body.word,
      image_url: req.body.image_url,
      sound_text: req.body.sound_text
    });
    await newVegetable.save();
    res.status(201).json(newVegetable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
