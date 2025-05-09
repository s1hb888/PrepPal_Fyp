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


router.put('/update', verifyToken, async (req, res) => {
  const { password, kidName, kidAge } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (password) user.password = password; // Just assign, hashing pre-save karega
    if (kidName) user.kidName = kidName;

    if (kidAge) {
      const kidAgeNumber = parseInt(kidAge);

      // Validate Kid's Age only if user is 'kid' role
      if (user.role === 'kid') {
        if (kidAgeNumber < 3 || kidAgeNumber > 5) {
          return res.status(400).json({ message: "Kid's age must be between 3 and 5 years." });
        }
      }

      user.kidAge = kidAgeNumber;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});



// Delete Account Route
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    // Find and delete user by ID
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


module.exports = router;
