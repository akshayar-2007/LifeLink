const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ─────────────────────────────────────
// @route   GET /api/donors/profile/me
// @desc    Get my own profile
// @access  Private (needs token)
// ─────────────────────────────────────
router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    // it decoded the JWT token and gave us the user id
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   PUT /api/donors/profile
// @desc    Update my profile + save location
// @access  Private (needs token)
// ─────────────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    // Get fields from request body
    const { 
      name,
      phone,
      city, 
      state, 
      lastDonated,
      latitude,    // we receive lat and lng separately
      longitude 
    } = req.body;

    // Build update object
    // Only update fields that are provided
    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (lastDonated) updateFields.lastDonated = lastDonated;

    // If coordinates provided → save location
    if (latitude && longitude) {
      updateFields.location = {
        type: "Point",
        coordinates: [
          parseFloat(longitude),  // longitude FIRST in MongoDB
          parseFloat(latitude)    // latitude SECOND
        ]
      };
    }

    // Find user and update
    // { new: true } → returns updated user not old one
    // { runValidators: true } → runs schema validation
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   PUT /api/donors/availability
// @desc    Toggle availability on/off
// @access  Private (needs token)
// ─────────────────────────────────────
router.put("/availability", authMiddleware, async (req, res) => {
  try {
    // Find the current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Toggle: if true → false, if false → true
    user.isAvailable = !user.isAvailable;

    // Save to database
    await user.save();

    res.json({
      msg: `You are now ${user.isAvailable ? "Available" : "Not Available"} for donation`,
      isAvailable: user.isAvailable
    });

  } catch (error) {
    console.error("Toggle availability error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/donors/:id
// @desc    Get any donor profile by ID
// @access  Private (needs token)
// ─────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // req.params.id → the id in the URL
    // Example: /api/donors/64abc123 → req.params.id = "64abc123"
    const donor = await User.findById(req.params.id).select("-password");

    if (!donor) {
      return res.status(404).json({ msg: "Donor not found" });
    }

    res.json(donor);

  } catch (error) {
    console.error("Get donor error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;