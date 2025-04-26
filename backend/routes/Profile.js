const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Update Profile Route
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
