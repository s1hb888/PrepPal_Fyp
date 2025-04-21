const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role } = req.body;

  // Validate input fields
  if (!email || !password || !kidName || !kidAge) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format. Please enter a valid email address.' });
  }

  try {
   
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and contain an uppercase letter, a digit, and a special character.' });
    }

    // Validate Kid's Name
    if (!kidName) {
      return res.status(400).json({ message: "Kid's name is required." });
    }

    // Validate Kid's Age
    if (!kidAge) {
      return res.status(400).json({ message: "Kid's age is required." });
    }

    const userRole = role || 'parent';


    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      role: userRole,
    });

    const savedUser = await user.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required. Please enter your registered email address.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required. Please enter your password.' });
  }

  try {
  
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({ message: 'This email is not registered. Please create an account.' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);

 
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  
    res.status(200).json({ message: 'Login successful.', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


module.exports = router;
