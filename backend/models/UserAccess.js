// models/UserAccess.js

const mongoose = require('mongoose');

const UserAccessSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restricted: {
    type: Boolean,
    default: false
  },
  access: {
    numbers: [{ type: mongoose.Schema.Types.ObjectId }],
    alphabets: [{ type: mongoose.Schema.Types.ObjectId }],
    urdu_alphabets: [{ type: mongoose.Schema.Types.ObjectId }],
    animals: [{ type: mongoose.Schema.Types.ObjectId }],
    fruits: [{ type: mongoose.Schema.Types.ObjectId }],
    vegetables: [{ type: mongoose.Schema.Types.ObjectId }],
    body_parts: [{ type: mongoose.Schema.Types.ObjectId }],
    shapes: [{ type: mongoose.Schema.Types.ObjectId }],
    counting: [{ type: mongoose.Schema.Types.ObjectId }]
  }
});

module.exports = mongoose.model('User_Access', UserAccessSchema);
