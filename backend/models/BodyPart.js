const mongoose = require('mongoose');

const BodyPartSchema = new mongoose.Schema({
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

module.exports = mongoose.model('BodyPart', BodyPartSchema);
