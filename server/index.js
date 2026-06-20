// Import required packages
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donors");
// Load environment variables from .env file
// Must be called before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

// Create express app
const app = express();

// MIDDLEWARE
// cors → allows frontend (React) to call this backend
// express.json → allows server to read JSON data from requests
app.use(cors());
app.use(express.json());

// TEST ROUTE
// When someone visits http://localhost:5000/
// They see "Blood Donor API is running"
app.get("/", (req, res) => {
  res.json({ 
    message: "🩸 Blood Donor Finder API is Running",
    status: "success"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
// GET PORT FROM .env OR USE 5000
const PORT = process.env.PORT || 5000;

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});