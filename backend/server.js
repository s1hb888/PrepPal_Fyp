// =======================
//  server.js (Merged)
// =======================
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const axios = require("axios");

require('dotenv').config();

// ----------------- ROUTES -----------------
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/Profile');
const vowelRoutes = require('./routes/vowel');
const bodyPartRoute = require('./routes/bodypart');
const fruitRoutes = require('./routes/fruit');
const vegetableRoutes = require('./routes/vegetable');
const feedbackRoutes = require('./routes/feedbackRoutes');
const videoRoutes = require('./routes/videoRoutes');
const screenTimeRoutes = require('./routes/screenTime');
const { router: notificationRoutes, checkForceKills } = require('./routes/notification');
const quizRoutes = require('./routes/quiz');
const resultRoutes = require('./routes/quizResults');
const duaRoutes = require('./routes/duas');
const basicQuestionsRoute = require('./routes/basicQuestions');
const countingRoutes = require("./routes/counting");
const performanceRoutes = require("./routes/performance");
const quizBodyPartRoutes = require("./routes/quizBodyPart");
const quizFruitRoutes = require("./routes/quizFruit");
const quizVegetableRoutes = require("./routes/quizVegetable");
const quizColorRoutes = require("./routes/quizColor");
const quizCountingRoutes = require("./routes/quizCounting");
// ----------------- MODELS -----------------
const User = require('./models/User');
const Alphabet = require('./models/Alphabet');
const Urdu = require('./models/Urdu');
const NumberModel = require('./models/Number');
const Video = require('./models/Video');

// ----------------- DB CONNECTION -----------------
const connectDB = require('./config/db');
connectDB();

// ----------------- APP INIT -----------------
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------- STATIC FILES -----------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------- ROUTE MAPPINGS -----------------
app.use('/api/videos', videoRoutes);
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/vowels', vowelRoutes);
app.use('/api/bodyparts', bodyPartRoute);
app.use('/api/fruits', fruitRoutes);
app.use('/api/vegetables', vegetableRoutes);
app.use('/api/screen-time', screenTimeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/duas', duaRoutes);
app.use('/api/basic-questions', basicQuestionsRoute);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/counting', countingRoutes);
app.use('/api/performance', performanceRoutes);
app.use("/api/quizBodyParts", quizBodyPartRoutes);
app.use("/api/quizFruit", quizFruitRoutes);
app.use("/api/quizVegetables", quizVegetableRoutes);
app.use("/api/quizColor", quizColorRoutes);
app.use("/api/quizCounting", quizCountingRoutes);
// ----------------- EXPORTS -----------------
module.exports = { app };

// ----------------- SERVER START -----------------
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
