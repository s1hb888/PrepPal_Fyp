// backend/models/User.js
const mongoose = require('mongoose');

// Define the schema for user registration
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  kidName: {
    type: String,
    required: true
  },
  kidAge: {
    type: Number,
    required: true,
  }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
