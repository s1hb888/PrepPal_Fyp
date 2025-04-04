const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge } = req.body;

  // Validate input fields
  if (!email || !password || !kidName || !kidAge) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      role: 'parent', // Set the default role as 'parent' or use custom logic
    });

    // Save user to the database
    await user.save();

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required.' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'This email is not registered. Please create an account.' });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    // Check if role matches
    if (role !== user.role) {
      return res.status(400).json({ message: `Invalid role. Please login as ${user.role}` });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

module.exports = router;

