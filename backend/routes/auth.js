const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role } = req.body;

  // Validate input fields
  if (!email || !password || !kidName || !kidAge) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate Email Format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zAZ]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format. Please enter a valid email address.' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Validate Password Strength
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

    // Set default role to 'parent' if not provided
    const userRole = role || 'parent';

    // Create new user
    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      role: userRole,
    });

    // Just save, hashing is handled in model's pre-save hook
    const savedUser = await user.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // FR-2.1.2: Check if email is empty
  if (!email) {
    return res.status(400).json({ message: 'Email is required. Please enter your registered email address.' });
  }

  // FR-2.1.3: Check if password is empty
  if (!password) {
    return res.status(400).json({ message: 'Password is required. Please enter your password.' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // FR-2.1.1.1: If user not found
    if (!user) {
      return res.status(400).json({ message: 'This email is not registered. Please create an account.' });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);

    // FR-2.1.1.2: If password doesn't match
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password. Please try again.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // FR-2.1.4: Success message + token + role
    res.status(200).json({ message: 'Login successful.', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});
router.put('/update', verifyToken, async (req, res) => {
  const { password, kidName, kidAge } = req.body;

  try {
    // Find user by ID from token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (kidName) user.kidName = kidName;
    if (kidAge) user.kidAge = kidAge;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Delete Account Route
router.delete('/delete', verifyToken, async (req, res) => {
  const email = req.user.email;  // Email from decoded token

  try {
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


module.exports = router;
