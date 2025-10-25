const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  subject: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  correct: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number, // percentage
    default: 0,
  },
  avgTimeSec: {
    type: Number,
    default: 0,
  },
  done: {
    type: Boolean,  // ✅ new field
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Performance', PerformanceSchema);
