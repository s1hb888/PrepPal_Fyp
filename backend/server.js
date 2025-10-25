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
const worshipRoute = require('./routes/worship');
const basicQuestionsRoute = require('./routes/basicQuestions');
const countingRoutes = require("./routes/counting");
const performanceRoutes = require("./routes/performance");

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
app.use('/api/worship', worshipRoute);
app.use('/api/basic-questions', basicQuestionsRoute);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/counting', countingRoutes);
app.use('/api/performance', performanceRoutes);

// ----------------- EXPO PUSH HELPER -----------------
const sendFCM = async (userId, message) => {
  try {
    const user = await User.findById(userId);
    const expoToken = user?.expoToken; // Expo Push Token
    if (!expoToken) return;

    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoToken,
      sound: "default",
      title: "PrepPal Alert",
      body: message,
    });

    console.log('Expo Push sent to user:', userId);
  } catch (err) {
    console.error('Expo Push Error:', err.message);
  }
};

// Periodic check for force kills (every 5 sec)
setInterval(() => {
  checkForceKills();
}, 5000);

// ----------------- EXPORTS -----------------
module.exports = { app, sendFCM };

// ----------------- SERVER START -----------------
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
});
