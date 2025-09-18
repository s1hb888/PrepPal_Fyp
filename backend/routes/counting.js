const express = require("express");
const router = express.Router();
const Counting = require("../models/Counting");

// ✅ Get all counting items
router.get("/", async (req, res) => {
  try {
    const items = await Counting.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch counting data" });
  }
});

// ✅ Add new counting item (optional for seeding)
router.post("/", async (req, res) => {
  try {
    const { word, image_url, sound_text } = req.body;
    const newItem = new Counting({ word, image_url, sound_text });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add counting item" });
  }
});

module.exports = router;
