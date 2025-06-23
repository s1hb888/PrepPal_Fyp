const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// 📌 Route to fetch videos for mobile app
router.get('/get-videos', async (req, res) => {
  try {
    const videos = await Video.find({}, 'title category description url');

    const updatedVideos = videos.map(video => ({
      _id: video._id,  // Needed for FlatList keyExtractor
      title: video.title,
      category: video.category,
      description: video.description,
      url: video.url
    }));

    res.json(updatedVideos);
  } catch (err) {
    console.error('Error fetching videos:', err.message);
    res.status(500).json({ error: 'Server error while fetching videos.' });
  }
});

module.exports = router;
