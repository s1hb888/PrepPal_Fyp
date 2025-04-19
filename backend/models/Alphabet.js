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
  }
});

module.exports = mongoose.model('Alphabet', AlphabetSchema);
