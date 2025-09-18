const mongoose = require("mongoose");

const CountingSchema = new mongoose.Schema({
  word: { type: String, required: true },        // e.g., "One"
  image_url: { type: String, required: true },   // link to image
  sound_text: { type: String, required: true }   // e.g., "This is one"
});

module.exports = mongoose.model("Counting", CountingSchema);
