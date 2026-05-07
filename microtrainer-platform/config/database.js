// =======================================================
// 🗄️ DATABASE CONNECTION
// MongoDB connection with Mongoose
// =======================================================

const mongoose = require('mongoose');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    console.log('✅ Using existing database connection');
    return;
  }
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microtrainer-platform';
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Falling back to in-memory storage');
    isConnected = false;
  }
}

function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDbConnected
};
