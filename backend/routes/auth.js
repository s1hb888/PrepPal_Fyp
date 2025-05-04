

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserAccess = require('../models/UserAccess');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Alphabet = require('../models/Alphabet');
const Number = require('../models/Number');
const Urdu = require('../models/Urdu');
const bcrypt = require('bcryptjs');

// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role } = req.body;

  // Validate input fields
  if (!email || !password || !kidName || !kidAge) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  

  // Validate Email Format
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

    const userRole = role || 'parent';

    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      role: userRole,
    });

    const savedUser = await user.save();

    const accessEntry = {
      user_id: savedUser._id,
      restricted: false,
      access: {
        numbers: [],
        alphabets: [],
        urdu_alphabets: [],
        animals: [],
        fruits: [],
        vegetables: [],
        body_parts: [],
        shapes: [],
        counting: []
      }
    };
    await UserAccess.create(accessEntry);

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Login Route
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


// Update Numbers Access
router.put('/update/numbers/access', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { numbers } = req.body;

  if (!userId) return res.status(400).json({ message: 'User ID not found in token' });

  try {
    const updated = await UserAccess.findOneAndUpdate(
      { user_id: userId },
      { $set: { 'access.numbers': numbers } },
      { new: true }
    );

    return res.json({ message: 'Access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Urdu Access
router.put('/update/urdu/access', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { urdu } = req.body;

  if (!userId) return res.status(400).json({ message: 'User ID not found in token' });

  try {
    const updated = await UserAccess.findOneAndUpdate(
      { user_id: userId },
      { $set: { 'access.urdu_alphabets': urdu } },
      { new: true }
    );

    return res.json({ message: 'Access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Alphabets Access
router.put('/update/alphabets/access', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { alphabets } = req.body;

  if (!userId) return res.status(400).json({ message: 'User ID not found in token' });

  try {
    const updated = await UserAccess.findOneAndUpdate(
      { user_id: userId },
      { $set: { 'access.alphabets': alphabets } },
      { new: true }
    );

    return res.json({ message: 'Access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Alphabets Access
router.get('/access/alphabets', verifyToken, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in token' });
  }

  try {
    const userAccess = await UserAccess.findOne({ user_id: userId });
    let alphabetIds = userAccess?.access?.alphabets || [];
    let alphabets = !alphabetIds.length ? await Alphabet.find({}) : await Alphabet.find({ _id: { $in: alphabetIds } });

    return res.json(alphabets);
  } catch (err) {
    console.error('Error fetching alphabet access:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Numbers Access
router.get('/access/numbers', verifyToken, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in token' });
  }

  try {
    const userAccess = await UserAccess.findOne({ user_id: userId });
    let numbersIds = userAccess?.access?.numbers || [];
    let numbers = !numbersIds.length ? await Number.find({}) : await Number.find({ _id: { $in: numbersIds } });

    return res.json(numbers);
  } catch (err) {
    console.error('Error fetching numbers access:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Urdu Access
router.get('/access/urdu', verifyToken, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in token' });
  }

  try {
    const userAccess = await UserAccess.findOne({ user_id: userId });
    let urduIds = userAccess?.access?.urdu_alphabets || [];
    let urdu = !urduIds.length ? await Urdu.find({}) : await Urdu.find({ _id: { $in: urduIds } });

    return res.json(urdu);
  } catch (err) {
    console.error('Error fetching urdu access:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
