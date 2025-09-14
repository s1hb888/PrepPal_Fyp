

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserAccess = require('../models/UserAccess');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Alphabet = require('../models/Alphabet');
const Number = require('../models/Number');
const Urdu = require('../models/Urdu');
const ScreenTime = require('../models/ScreenTime');


// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role, city, area } = req.body;

  // Validate input fields
  if (!email || !password || !kidName || !kidAge || !city || !area) {
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
      city,
      area,
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
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: 'This email is not registered.' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password.' });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save token in user document
    user.token = token;
    await user.save();

    // Only apply screen time if user selected 'kid' mode
    if (role === 'kid') {
      const today = new Date().toDateString();
      let screenTime = await ScreenTime.findOne({ userId: user._id });

      if (!screenTime) {
        // Initialize if not found
        screenTime = await ScreenTime.create({
          userId: user._id,
          dailyUsageLimit: 3,
          totalDailyTime: 15,
          usageCountToday: 0,
          totalUsedTimeToday: 0,
          isLocked: false
        });
      }

      const {
        dailyUsageLimit,
        totalDailyTime,
        usageCountToday = 0,
        totalUsedTimeToday = 0,
        lastReset,
        lastSessionEndTime,
        nextSessionGap = 5, // in minutes
        sessionStartTime
      } = screenTime;

      // Reset on new day
      if (!lastReset || new Date(lastReset).toDateString() !== today) {
        screenTime.usageCountToday = 0;
        screenTime.totalUsedTimeToday = 0;
        screenTime.lastReset = new Date();
      }

      // Limit check
      if (usageCountToday >= dailyUsageLimit || totalUsedTimeToday >= totalDailyTime) {
        return res.status(403).json({
          message: 'Daily screen time limit reached or exceeded. Try again tomorrow.',
          lock: true
        });
      }

      // Cooldown check
      if (lastSessionEndTime) {
        const nextAllowedTime = new Date(lastSessionEndTime).getTime() + nextSessionGap * 60000;
        if (Date.now() < nextAllowedTime) {
          const waitMinutes = Math.ceil((nextAllowedTime - Date.now()) / 60000);
          return res.status(403).json({
            message: `Next session will start in ${waitMinutes} minute(s). Please try again later.`,
            lock: true
          });
        }
      }

      // End previous session
      if (sessionStartTime) {
        screenTime.lastSessionEndTime = new Date();
      }

      // Start new session
      screenTime.sessionStartTime = Date.now();
      screenTime.isLocked = false;
      screenTime.usageCountToday += 1;
      await screenTime.save();
    }

    // Send response
    res.status(200).json({
      message: 'Login successful.',
      token,
      role, // return the selected role
      user: {
        _id: user._id,
        email: user.email,
        role, // override DB role with selected role
        kidName: user.kidName,
        kidAge: user.kidAge,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/logout
// -----------------------------------------------------------------------------
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    // End kid screen-time session
    if (role === 'kid') {
      const screenTime = await ScreenTime.findOne({ userId });
      if (screenTime && screenTime.sessionStartTime) {
        const elapsedMinutes = Math.ceil(
          (Date.now() - screenTime.sessionStartTime) / 60000
        );

        screenTime.totalUsedTimeToday += elapsedMinutes;
        screenTime.lastSessionEndTime = new Date();
        screenTime.sessionStartTime = null;
        await screenTime.save();
      }
    }

    // Clear token in user document
    const user = await User.findById(userId);
    if (user) {
      user.token = null;
      await user.save();
    }

    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout.' });
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
