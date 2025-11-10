// models/UserAccess.js

const mongoose = require('mongoose');

const AccessSettingsSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'accessType' }, // refPath allows reuse
  min_attempts: { type: Number, default: 3 },
  min_time_avg: { type: Number, default: 2.0 },
  min_correct_avg: { type: Number, default: 80 },
  active: { type: Boolean, default: true }
});

const UserAccessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  access: {
    numbers: [AccessSettingsSchema],
    alphabets: [AccessSettingsSchema],
    urdu_alphabets: [AccessSettingsSchema]
  }
});

module.exports = mongoose.model('User_Access', UserAccessSchema);
