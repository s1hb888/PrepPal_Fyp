const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const connectDB = require('./config/db');
const Alphabet = require('./models/Alphabet')
const Urdu = require('./models/Urdu')
const Number = require('./models/Number')
const UserAccess = require('./models/UserAccess')
require('dotenv').config();  // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use the authentication routes
app.use('/api', authRoutes);
app.get('/alphabets', async (req, res) => {
  try {
    const data = await Alphabet.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
app.get('/urdu', async (req, res) => {
  try {
    const data = await Urdu.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
app.get('/numbers', async (req, res) => {
  try {
    const data = await Number.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });