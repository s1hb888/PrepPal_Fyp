const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role } = req.body;

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

    // Set default role to 'parent' if not provided
    const userRole = role || 'parent'; // If no role is provided, default to 'parent'

    // Create new user
    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      role: userRole, // Set the role as per the user selection (or default to 'parent')
    });

    // Save user to the database
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    // No need to check role here; assume user logs in based on the role selected during login (if provided)
    // We don't check roles unless explicitly passed. User will automatically go to correct page.

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response with the token and role
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