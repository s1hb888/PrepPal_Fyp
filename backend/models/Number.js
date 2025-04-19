// models/Number.js

const mongoose = require('mongoose');

const NumberSchema = new mongoose.Schema({
  number: {
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

module.exports = mongoose.model('Number', NumberSchema);
