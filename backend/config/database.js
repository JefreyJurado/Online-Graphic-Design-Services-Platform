const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    // Don't process.exit() here: this runs inside a Vercel serverless
    // function, and exiting kills the whole function invocation (every
    // in-flight request), not just this one. Mongoose buffers queries
    // until connected and rejects them on timeout if it never connects,
    // so leaving the process alive lets individual route handlers fail
    // gracefully with their own try/catch instead of taking down the API.
  }
};

module.exports = connectDB;