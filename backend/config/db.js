// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get the Mongo URI from the environment variables
    const mongoURI = process.env.MONGO_URI;
    // Connect to MongoDB using the URI
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
