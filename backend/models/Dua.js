const mongoose = require('mongoose');

const DuaSchema = new mongoose.Schema({
  dua_name: { type: String, required: true },
  image_url: { type: String, required: true },
  sound_dua: { type: String, required: true },
  dua: { type: String, required: true },
  sound_translation: { type: String, required: true },
  translation: { type: String, required: true }
});

module.exports = mongoose.model('Dua', DuaSchema);
