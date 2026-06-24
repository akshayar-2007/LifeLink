const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { 
      bloodGroup,   
      city,         
      latitude,    
      longitude,    
      radius = 20   
    } = req.query;

    let query = {};
    query.isAvailable = true;
    query._id = { $ne: req.user.id };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (city && !latitude) {
      query.city = new RegExp(city, "i");
    }

    if (latitude && longitude) {
      const radiusInMeters = parseFloat(radius) * 1000;
      
      if (bloodGroup) {
        query.bloodGroup = bloodGroup;
      }

      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitude),  
              parseFloat(latitude)
            ]
          },
          $maxDistance: radiusInMeters
        }
      };

      const donors = await User.find(query)
        .select("-password")
        .limit(20); 

      const donorsWithDistance = donors.map(donor => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          donor.location.coordinates[1],  
          donor.location.coordinates[0]   
        );

        return {
          ...donor.toObject(),
          distance: Math.round(distance * 10) / 10  
        };
      });

      return res.json({
        count: donorsWithDistance.length,
        searchType: "location",
        radius: `${radius}km`,
        donors: donorsWithDistance
      });
    }

    const donors = await User.find(query)
      .select("-password")
      .limit(20);

    res.json({
      count: donors.length,
      searchType: city ? "city" : "bloodGroup",
      donors
    });

  } catch (error) {
    console.error("Search donors error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; 
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

router.get("/profile/me", authMiddleware, async (req, res) => {
  try {
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

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      state,
      lastDonated,
      latitude,
      longitude
    } = req.body;

    const updateFields = {};

    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (lastDonated) updateFields.lastDonated = lastDonated;

    if (latitude && longitude) {
      updateFields.location = {
        type: "Point",
        coordinates: [
          parseFloat(longitude),
          parseFloat(latitude)
        ]
      };
    }

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

router.put("/availability", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.isAvailable = !user.isAvailable;
    await user.save();

    res.json({
      msg: `You are now ${user.isAvailable ? "Available ✅" : "Not Available ❌"} for donation`,
      isAvailable: user.isAvailable
    });

  } catch (error) {
    console.error("Toggle error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
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