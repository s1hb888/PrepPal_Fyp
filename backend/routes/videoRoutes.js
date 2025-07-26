const express = require('express');
const router = express.Router();
const path = require('path');
const Video = require('../models/Video');

// Load static JSON
const videosData = require(path.join(__dirname, '../JsonCollections/preppal_videos.json'));

// Fetch Videos – Seed DB if none found
router.get('/', async (req, res) => {
  try {
    let videos = await Video.find({}, 'title category description url');

    if (!videos || videos.length === 0) {
      console.log('⚠ No videos in DB. Seeding now from JSON...');

      // Save all videos from JSON file to DB
      const inserted = await Video.insertMany(videosData);
      console.log(`✅ Seeded ${inserted.length} videos into DB`);

      // Fetch again after seeding
      videos = await Video.find({}, 'title category description url');
    }

    // Transform for frontend (if needed)
    const updatedVideos = videos.map(video => ({
      _id: video._id,
      title: video.title,
      category: video.category,
      description: video.description,
      url: video.url,
    }));

    res.json(updatedVideos);
  } catch (err) {
    console.error('❌ Error fetching or seeding videos:', err.message);
    res.status(500).json({ error: 'Failed to fetch or seed videos' });
  }
});

module.exports = router;
