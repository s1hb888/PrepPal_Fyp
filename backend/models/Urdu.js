// models/Urdu.js

const mongoose = require('mongoose');

const UrduSchema = new mongoose.Schema({
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
  // 👇 Added configuration fields
  min_attempts: {
    type: Number,
    default: 3, // default value if not provided
  },
  min_time_avg: {
    type: Number,
    default: 2.0, // in seconds or whatever your app logic uses
  },
  min_correct_avg: {
    type: Number,
    default: 80, // percentage threshold
  }
});

module.exports = mongoose.model('Urdu_Alphabet', UrduSchema);
