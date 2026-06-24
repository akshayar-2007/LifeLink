const express = require("express");
const Request = require("../models/Request");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmergencyEmail, sendRequestConfirmation } = require("../utils/sendEmail");

const router = express.Router();


// ─────────────────────────────────────
// @route   POST /api/requests
// @desc    Create emergency blood request
// @access  Private
// ─────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { 
      bloodGroup, 
      hospital, 
      city, 
      state, 
      message, 
      urgency 
    } = req.body;

    // STEP 1: Validate required fields
    if (!bloodGroup || !hospital || !city || !state) {
      return res.status(400).json({ 
        msg: "Please provide bloodGroup, hospital, city and state" 
      });
    }

    // STEP 2: Create the request in database
    const newRequest = new Request({
      requestedBy: req.user.id,
      bloodGroup,
      hospital,
      city,
      state,
      message,
      urgency: urgency || "normal"
    });

    await newRequest.save();

    // STEP 3: Find matching donors
    // Must match: blood group + city + available + not the requester
    const matchingDonors = await User.find({
      bloodGroup,
      city: new RegExp(city, "i"),  // case insensitive
      isAvailable: true,
      _id: { $ne: req.user.id }     // exclude requester
    });

    console.log(`Found ${matchingDonors.length} matching donors`);

    // STEP 4: Get requester details for email
    const requester = await User.findById(req.user.id);

    // STEP 5: Send email to each matching donor
    // Promise.all sends all emails simultaneously (parallel)
    // Much faster than sending one by one
    const emailPromises = matchingDonors.map(donor => 
      sendEmergencyEmail({
        donorEmail: donor.email,
        donorName: donor.name,
        request: newRequest,
        requester
      })
    );

    // Wait for all emails to send
    await Promise.all(emailPromises);

    // STEP 6: Send confirmation to requester
    await sendRequestConfirmation({
      requesterEmail: requester.email,
      requesterName: requester.name,
      donorsCount: matchingDonors.length,
      request: newRequest
    });

    // STEP 7: Update request with donor count
    newRequest.donorsNotified = matchingDonors.length;
    await newRequest.save();

    // STEP 8: Send response
    res.status(201).json({
      msg: "Emergency request created successfully",
      request: newRequest,
      donorsNotified: matchingDonors.length,
      donors: matchingDonors.map(d => ({
        name: d.name,
        city: d.city,
        bloodGroup: d.bloodGroup
      }))
    });

  } catch (error) {
    console.error("Create request error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/requests
// @desc    Get all open requests
// @access  Private
// ─────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    // Build filter
    let filter = { status: "open" };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, "i");

    // populate("requestedBy") → replaces the ID with
    // actual user data so we can show requester name
    const requests = await Request.find(filter)
      .populate("requestedBy", "name phone city")
      .sort({ createdAt: -1 })  // newest first
      .limit(20);

    res.json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error("Get requests error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/requests/mine
// @desc    Get my own requests
// @access  Private
// ─────────────────────────────────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ 
      requestedBy: req.user.id 
    })
    .populate("respondedBy", "name phone bloodGroup")
    .sort({ createdAt: -1 });

    res.json({
      count: requests.length,
      requests
    });

  } catch (error) {
    console.error("Get my requests error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   POST /api/requests/:id/respond
// @desc    Donor responds to a request
// @access  Private
// ─────────────────────────────────────
router.post("/:id/respond", authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    // Check if request is still open
    if (request.status !== "open") {
      return res.status(400).json({ 
        msg: "This request is no longer open" 
      });
    }

    // Check if donor already responded
    if (request.respondedBy.includes(req.user.id)) {
      return res.status(400).json({ 
        msg: "You have already responded to this request" 
      });
    }

    // Add donor to respondedBy list
    request.respondedBy.push(req.user.id);
    await request.save();

    // Get donor details to notify requester
    const donor = await User.findById(req.user.id);
    const requester = await User.findById(request.requestedBy);

    // Send email to requester that donor responded
    const { sendEmail } = require("../utils/sendEmail");
    
    await sendEmail({
      to: requester.email,
      subject: `✅ ${donor.name} is responding to your blood request`,
      html: `
        <div style="font-family:Arial; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="color:#28a745;">🎉 A Donor is Coming!</h2>
          <p>Great news! <strong>${donor.name}</strong> has responded to your blood request.</p>
          
          <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin:15px 0;">
            <p><strong>Donor Name:</strong> ${donor.name}</p>
            <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
            <p><strong>Phone:</strong> ${donor.phone}</p>
            <p><strong>City:</strong> ${donor.city}</p>
          </div>

          <p>Please contact the donor directly to coordinate.</p>
          <p style="color:#666;">Stay strong. Help is on the way! 🙏</p>
        </div>
      `
    });

    res.json({
      msg: "You have successfully responded to this request",
      request,
      requesterContact: {
        name: requester.name,
        phone: requester.phone,
        hospital: request.hospital
      }
    });

  } catch (error) {
    console.error("Respond error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private (only requester)
// ─────────────────────────────────────
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }
    

    // Only the person who made the request can update it
    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        msg: "Not authorized to update this request" 
      });
    }

    request.status = status;
    await request.save();

    res.json({
      msg: `Request marked as ${status}`,
      request
    });

  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;