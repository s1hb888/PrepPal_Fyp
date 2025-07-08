const mongoose = require('mongoose');

const ScreenTimeSchema = new mongoose.Schema({
  /* parent‑configurable */
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
  dailyUsageLimit: { type: Number, default: 0 },
  sessionDuration: { type: Number, default: 0 },      // minutes
  totalDailyTime:  { type: Number, default: 0 },      // minutes
  nextSessionGap:  { type: Number, default: 0 },      // minutes
  notificationsEnabled: { type: Boolean, default: false },

  /* runtime */
  openCountToday:     { type: Number, default: 0 },
  totalUsedTimeToday: { type: Number, default: 0 },
  isLocked:           { type: Boolean, default: false },

  /* timestamps */
  lastReset:         { type: Date,   default: Date.now },
  sessionStartTime:  { type: Date,   default: null },
  sessionEndTime:    { type: Date,   default: null },
  startFormatted:    { type: String, default: null },
  endFormatted:      { type: String, default: null },
  lastSessionEndTime:{ type: Date,   default: null }
},{timestamps:true});

module.exports = mongoose.model('ScreenTime', ScreenTimeSchema);
