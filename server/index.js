const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donors");
const requestRoutes = require("./routes/requests");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");

dotenv.config();
connectDB();

const app = express();

// CORS — allow both local and production frontend
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(generalLimiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "🩸 LifeLink API Running",
    status: "success",
    version: "1.0.0"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "Something went wrong",
    error: process.env.NODE_ENV === "development"
      ? err.message
      : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LifeLink API running on port ${PORT}`);
});