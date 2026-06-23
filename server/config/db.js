const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const localURI = 'mongodb://127.0.0.1:27017/the_eco';

  if (primaryURI && primaryURI !== localURI) {
    try {
      console.log('Connecting to primary MongoDB URI...');
      const conn = await mongoose.connect(primaryURI, {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
      });
      console.log(`MongoDB Connected (Primary): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`Failed to connect to primary MongoDB: ${error.message}`);
      console.log('Attempting connection to local MongoDB fallback...');
    }
  }

  try {
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to local MongoDB fallback: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

