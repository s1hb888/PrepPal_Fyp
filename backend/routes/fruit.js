const express = require('express');
const router = express.Router();
const Fruit = require('../models/Fruit');

// Get all fruits
router.get('/', async (req, res) => {
  try {
    const fruits = await Fruit.find();
    res.json(fruits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: Add new fruit
router.post('/', async (req, res) => {
  try {
    const newFruit = new Fruit({
      word: req.body.word,
      image_url: req.body.image_url,
      sound_text: req.body.sound_text
    });
    await newFruit.save();
    res.status(201).json(newFruit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
