// models/Alphabet.js

const mongoose = require('mongoose');

const AlphabetSchema = new mongoose.Schema({
  alphabet: {
    type: String,
    required: true
  },
  word: {
    type: String,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  sound_text: {
    type: String,
    required: true
  },
  // 👇 Added fields for progress/learning criteria
  min_attempts: {
    type: Number,
    default: 3
  },
  min_time_avg: {
    type: Number,
    default: 2.0
  },
  min_correct_avg: {
    type: Number,
    default: 80
  }
});

module.exports = mongoose.model('Alphabet', AlphabetSchema);
