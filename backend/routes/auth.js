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
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/sendEmail');


const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailExistence = require('email-existence');

router.post('/register', async (req, res) => {
  const { email, password, kidName, kidAge, role, city, area } = req.body;
  if (!email || !password || !kidName || !kidAge || !city || !area)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    // Check if email already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email is already registered.' });

    // Check if email actually exists (MX record)
    const emailExists = await new Promise((resolve) => {
      emailExistence.check(email, (err, exists) => {
        if (err) return resolve(false);
        resolve(exists);
      });
    });

    if (!emailExists) {
      return res.status(400).json({ message: 'Email address does not exist.' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      password,
      kidName,
      kidAge,
      city,
      area,
      role: role || 'parent',
      isVerified: false,
      verificationToken
    });

    const savedUser = await user.save();

    await UserAccess.create({
      user_id: savedUser._id,
      access: {
        numbers: [],
        alphabets: [],
        urdu_alphabets: []
      }
    });

    await sendVerificationEmail({ to: email, token: verificationToken });

    return res.status(201).json({ message: 'Verification link sent to your email.', userId: savedUser._id });
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// -----------------------
// Email Verification
router.get("/verify-email", async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) return res.status(400).send("<h2>Invalid verification link.</h2>");

  try {
    const user = await User.findOne({ email, verificationToken: token });
    if (!user) return res.status(400).send("<h2>Invalid or expired link.</h2>");
    if (user.isVerified) return res.send("<h2>Account already verified!</h2>");

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // Show confirmation page with deep link
    return res.send(`
      <h2> Account verified successfully!</h2>
      <p>You can now <a href="preppal://login">login in the PrepPal app</a> or 
         <a href="${process.env.FRONTEND_URL}">login on web</a>.</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h2>Server error. Please try again later.</h2>");
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

    // ✅ Check if email is verified
    if (!user.isVerified)
      return res.status(403).json({
        message: 'Your email is not verified. Please check your email and verify your account using the link sent to you.'
      });

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
        nextSessionGap = 5,
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
        role, 
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

// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not registered.' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save();

    // Send only token to email (raw)
    await sendResetPasswordEmail({ to: email, token: resetToken });

    res.status(200).json({ message: 'Reset token sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});


// ------------------------
// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, resetToken, password } = req.body;
  if (!email || !resetToken || !password) 
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const hashedToken = crypto.createHash('sha256').update(resetToken.trim()).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    user.password = password; // Make sure your User schema pre-save hook hashes password
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Try again later.' });
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
      { new: true, upsert: true }
    );

    return res.json({ message: 'Number access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Update Urdu Access
router.put('/update/urdu/access', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { alphabets } = req.body;
  console.log(req.body);
  if (!userId) return res.status(400).json({ message: 'User ID not found in token' });

  try {
    const updated = await UserAccess.findOneAndUpdate(
      { user_id: userId },
      { $set: { 'access.urdu_alphabets': alphabets } },
      { new: true }
    );

    return res.json({ message: 'Access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Alphabets Access
// routes/access.js (or wherever your route file is)
router.put('/update/alphabets/access', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { alphabets } = req.body;

  if (!userId) return res.status(400).json({ message: 'User ID not found in token' });

  try {
    // alphabets should be array of objects like:
    // [{ item_id: "ABC123", min_attempts: 3, min_time_avg: 2, min_correct_avg: 80 }, ...]

    const updated = await UserAccess.findOneAndUpdate(
      { user_id: userId },
      { $set: { 'access.alphabets': alphabets } },
      { new: true, upsert: true }
    );

    return res.json({ message: 'Alphabet access updated successfully', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get Alphabets Access
// routes/accessRoutes.js
router.get('/access/alphabets', verifyToken, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID not found in token' });
  }

  try {
    const userAccess = await UserAccess.findOne({ user_id: userId });
    const accessSettings = userAccess?.access?.alphabets || [];

    // Fetch ALL alphabets
    const alphabets = await Alphabet.find({});

    // Merge alphabets with user-specific access settings
    const enriched = alphabets.map((alphabet) => {
      const access = accessSettings.find(
        (a) => a.item_id?.toString() === alphabet._id.toString()
      );

      return {
        _id: alphabet._id,
        alphabet: alphabet.alphabet,
        word: alphabet.word,
        sound_text:alphabet.sound_text, 
        image_url: alphabet.image_url,
        active: access?.active ?? true, // default: true if not set
        min_attempts: access?.min_attempts ?? alphabet.min_attempts,
        min_time_avg: access?.min_time_avg ?? alphabet.min_time_avg,
        min_correct_avg: access?.min_correct_avg ?? alphabet.min_correct_avg,
      };
    });

    // Show only active ones
//    const filtered = enriched.filter((item) => item.active);

    return res.json(enriched);
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
    // Fetch user's access settings
    const userAccess = await UserAccess.findOne({ user_id: userId });
    const accessSettings = userAccess?.access?.numbers || [];

    // Fetch ALL Numbers
    const numbers = await Number.find({}); // Assuming model is named "Number"

    // Merge Numbers with user-specific access settings
    const enriched = numbers.map((num) => {
      const access = accessSettings.find(
        (a) => a.item_id?.toString() === num._id.toString()
      );

      return {
        _id: num._id,
        number: num.number,          // e.g. "1", "2", "3"
        word: num.word,
        sound_text:num.sound_text,               // e.g. "One", "Two"
        image_url: num.image_url,    // Image for number
        active: access?.active ?? true, // Default: true if not set
        min_attempts: access?.min_attempts ?? num.min_attempts,
        min_time_avg: access?.min_time_avg ?? num.min_time_avg,
        min_correct_avg: access?.min_correct_avg ?? num.min_correct_avg,
      };
    });

    // Optional: filter out inactive items
    // const filtered = enriched.filter((item) => item.active);

    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching number access:', err);
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
    // Fetch user's access settings
    const userAccess = await UserAccess.findOne({ user_id: userId });
    const accessSettings = userAccess?.access?.urdu_alphabets || [];

    // Fetch ALL Urdu alphabets
    const urduAlphabets = await Urdu.find({});

    // Merge Urdu alphabets with user-specific access settings
    const enriched = urduAlphabets.map((alphabet) => {
      const access = accessSettings.find(
        (a) => a.item_id?.toString() === alphabet._id.toString()
      );

      return {
        _id: alphabet._id,
        alphabet: alphabet.alphabet, // Urdu letter
        word: alphabet.word,
        sound_text:alphabet.sound_text,         // Urdu word (e.g., "الف → انار")
        image_url: alphabet.image_url,
        active: access?.active ?? true, // Default: true if not set
         min_attempts: access?.min_attempts ?? alphabet.min_attempts,
        min_time_avg: access?.min_time_avg ?? alphabet.min_time_avg,
        min_correct_avg: access?.min_correct_avg ?? alphabet.min_correct_avg,
      };
    });

    // Show only active ones (optional — uncomment if needed)
    // const filtered = enriched.filter((item) => item.active);

    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching Urdu alphabet access:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
