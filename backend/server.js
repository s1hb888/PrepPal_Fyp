const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');
require('dotenv').config(); // Load environment variables

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/Profile');
const vowelRoutes = require('./routes/vowel');
const bodyPartRoute = require('./routes/bodypart'); // BodyPart route added
const fruitRoutes = require('./routes/fruit'); //Fruits route added
const vegetableRoutes = require('./routes/vegetable');
// Models (for reference, though not used directly in server.js)
const Alphabet = require('./models/Alphabet');
const Urdu = require('./models/Urdu');
const Number = require('./models/Number');
 //  BodyPart model added

// DB Config

const connectDB = require('./config/db');


require('dotenv').config();  // Load environment variables

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/vowels', vowelRoutes);
app.use('/api/bodyparts', bodyPartRoute); // Body parts route used
app.use('/api/fruits', fruitRoutes); // Use fruits route
app.use('/api/vegetables', vegetableRoutes); // Use vegetables route
// Custom GET Routes
// Use the authentication routes
app.use('/api', authRoutes);
/* app.get('/alphabets', async (req, res) => {
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
}); */

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
