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
const videoRoutes = require('./routes/videoRoutes'); 
const screenTimeRoutes = require('./routes/screenTime');
const notificationRoutes = require('./routes/notification');
const quizRoutes = require('./routes/quiz');
 //  BodyPart model added

// DB Config

const connectDB = require('./config/db');



// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/videos', videoRoutes); 

// Use Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/vowels', vowelRoutes);
app.use('/api/bodyparts', bodyPartRoute); // Body parts route used
app.use('/api/fruits', fruitRoutes); 
app.use('/api/vegetables', vegetableRoutes); 
app.use('/api', authRoutes);
app.use('/api/screen-time', screenTimeRoutes);
app.use('/api/notifications', notificationRoutes); // ✅ correct
app.use('/api/quiz', quizRoutes);
// Start the server
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
