const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Load environment variables

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/Profile');

// Models
const Alphabet = require('./models/Alphabet');
const Urdu = require('./models/Urdu');
const Number = require('./models/Number');

// DB Config
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);

// Custom GET Routes
app.get('/alphabets', async (req, res) => {
  try {
    const data = await Alphabet.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alphabets data' });
  }
});

app.get('/urdu', async (req, res) => {
  try {
    const data = await Urdu.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch urdu data' });
  }
});

app.get('/numbers', async (req, res) => {
  try {
    const data = await Number.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch numbers data' });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(` Server running on port ${port}`);
});
