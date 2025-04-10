// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register API (POST: /api/register)
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format. Please enter a valid email address.' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain an uppercase letter, a digit, and a special character.' });
    }

    // Ensure kid's name and age are provided
    if (!kidName) {
      return res.status(400).json({ message: "Kid's name is required." });
    }
    if (!kidAge) {
      return res.status(400).json({ message: "Kid's age is required." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      kidName,
      kidAge
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET, // JWT secret from .env
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
