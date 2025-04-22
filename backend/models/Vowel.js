const mongoose = require('mongoose');

const VowelSchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true
  },
  sound_text: {
    type: String,
    enum: ['A', 'E', 'I', 'O', 'U'],
    required: true
  },
  alphabet: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Vowel', VowelSchema);
