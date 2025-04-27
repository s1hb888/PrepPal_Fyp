const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      kidName: user.kidName || '',
      kidAge: user.kidAge || '',
      profileImage: user.profileImage || '',
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Upload Profile Photo
router.put('/profile/photo', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded or invalid file type' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.profileImage = `/uploads/${req.file.filename}`;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      imageUrl: user.profileImage,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Update Profile Info
router.put('/update', verifyToken, async (req, res) => {
  const { password, kidName, kidAge } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

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

// Delete Account
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

module.exports = router;
