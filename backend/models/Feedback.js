const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  difficulty: {
    type: String,
    required: true,
  },
  suggestions: {
    type: String,
    maxlength: 500,
    default: '',
  },
  dateOfRating: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
