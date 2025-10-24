const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  },

  appEaseOfUse: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  performanceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  designSatisfaction: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  featureUsefulness: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  bugOrIssueExperience: {
    type: String,
    maxlength: 300,
    default: '',
  },

  suggestions: {
    type: String,
    maxlength: 500,
    default: '',
  },

  dateOfFeedback: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
