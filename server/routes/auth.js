const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      bloodGroup, 
      city, 
      state 
    } = req.body;
    if (!name || !email || !password || !phone || !bloodGroup || !city || !state) {
      return res.status(400).json({ 
        msg: "Please provide all required fields" 
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        msg: "User already exists with this email" 
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,   
      phone,
      bloodGroup,
      city,
      state
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },          
      process.env.JWT_SECRET,        
      { expiresIn: "7d" }           
    );
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

router.post("/login", async (req, res) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        msg: "Please provide email and password" 
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        msg: "Invalid credentials" 
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        msg: "Invalid credentials" 
      });
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
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

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");    
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);    
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