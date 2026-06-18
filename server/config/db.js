const mongoose = require("mongoose");

const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    
    // Connect to MongoDB using URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // If connected successfully print this
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    // If connection fails print error and stop server
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);  // Stop the app if DB fails
  }
};

module.exports = connectDB;