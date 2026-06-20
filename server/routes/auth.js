const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ─────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (no token needed)
// ─────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    // STEP 1: Get data from request body
    const { 
      name, 
      email, 
      password, 
      phone, 
      bloodGroup, 
      city, 
      state 
    } = req.body;

    // STEP 2: Validate all fields present
    if (!name || !email || !password || !phone || !bloodGroup || !city || !state) {
      return res.status(400).json({ 
        msg: "Please provide all required fields" 
      });
    }

    // STEP 3: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        msg: "User already exists with this email" 
      });
    }

    // STEP 4: Hash the password
    // 10 = salt rounds (how strong the encryption is)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // STEP 5: Create new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,   // save hashed not plain
      phone,
      bloodGroup,
      city,
      state
    });

    // STEP 6: Save user to MongoDB
    await newUser.save();

    // STEP 7: Create JWT token
    const token = jwt.sign(
      { id: newUser._id },          // payload (what we store in token)
      process.env.JWT_SECRET,        // secret key from .env
      { expiresIn: "7d" }           // token expires in 7 days
    );

    // STEP 8: Send response back
    res.status(201).json({
      msg: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        bloodGroup: newUser.bloodGroup,
        city: newUser.city,
        isAvailable: newUser.isAvailable
      }
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public (no token needed)
// ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    // STEP 1: Get email and password from request
    const { email, password } = req.body;

    // STEP 2: Validate fields
    if (!email || !password) {
      return res.status(400).json({ 
        msg: "Please provide email and password" 
      });
    }

    // STEP 3: Find user by email in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        msg: "Invalid credentials" 
      });
    }

    // STEP 4: Compare password with hashed password
    // bcrypt.compare returns true or false
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        msg: "Invalid credentials" 
      });
    }

    // STEP 5: Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // STEP 6: Send response
    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        city: user.city,
        isAvailable: user.isAvailable
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private (token needed)
// ─────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    // Get token from request header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id from token
    // .select("-password") means don't return password field
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(401).json({ msg: "Token is invalid" });
  }
});


module.exports = router;