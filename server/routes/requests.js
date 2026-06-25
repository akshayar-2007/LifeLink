const express = require("express");
const Request = require("../models/Request");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmergencyEmail, sendRequestConfirmation } = require("../utils/sendEmail");
const { createNotification, createBulkNotifications } = require("../utils/createNotification"); // ADD THIS

const router = express.Router();


// ─────────────────────────────────────
// @route   POST /api/requests
// @desc    Create emergency blood request
// @access  Private
// ─────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bloodGroup, hospital, city, state, message, urgency } = req.body;

    if (!bloodGroup || !hospital || !city || !state) {
      return res.status(400).json({ 
        msg: "Please provide bloodGroup, hospital, city and state" 
      });
    }

    // Create request
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

    // Find matching donors
    const matchingDonors = await User.find({
      bloodGroup,
      city: new RegExp(city, "i"),
      isAvailable: true,
      _id: { $ne: req.user.id }
    });

    const requester = await User.findById(req.user.id);

    // Send emails to all donors
    const emailPromises = matchingDonors.map(donor =>
      sendEmergencyEmail({
        donorEmail: donor.email,
        donorName: donor.name,
        request: newRequest,
        requester
      })
    );
    await Promise.all(emailPromises);

    // Send confirmation to requester
    await sendRequestConfirmation({
      requesterEmail: requester.email,
      requesterName: requester.name,
      donorsCount: matchingDonors.length,
      request: newRequest
    });

    // ── NEW: Save notifications for all matching donors ──
    if (matchingDonors.length > 0) {
      await createBulkNotifications({
        userIds: matchingDonors.map(d => d._id),
        type: "new_request",
        title: `🩸 New ${bloodGroup} Blood Request`,
        message: `Urgent request at ${hospital}, ${city}. Please respond if available.`,
        requestId: newRequest._id
      });
    }

    // Update donor count
    newRequest.donorsNotified = matchingDonors.length;
    await newRequest.save();

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

    let filter = { status: "open" };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, "i");

    const requests = await Request.find(filter)
      .populate("requestedBy", "name phone city")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ count: requests.length, requests });

  } catch (error) {
    console.error("Get requests error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/requests/mine
// @desc    Get my requests
// @access  Private
// ─────────────────────────────────────
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ requestedBy: req.user.id })
      .populate("respondedBy", "name phone bloodGroup")
      .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });

  } catch (error) {
    console.error("Get my requests error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   POST /api/requests/:id/respond
// @desc    Donor responds to request
// @access  Private
// ─────────────────────────────────────
router.post("/:id/respond", authMiddleware, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (request.status !== "open") {
      return res.status(400).json({ msg: "This request is no longer open" });
    }

    if (request.respondedBy.includes(req.user.id)) {
      return res.status(400).json({ msg: "You already responded to this request" });
    }

    // Add donor to responded list
    request.respondedBy.push(req.user.id);
    await request.save();

    const donor = await User.findById(req.user.id);
    const requester = await User.findById(request.requestedBy);

    // Send email to requester
    const { sendEmail } = require("../utils/sendEmail");
    await sendEmail({
      to: requester.email,
      subject: `✅ ${donor.name} is responding to your blood request`,
      html: `
        <div style="font-family:Arial; max-width:600px; margin:0 auto; padding:20px;">
          <h2 style="color:#28a745;">🎉 A Donor is Coming!</h2>
          <p><strong>${donor.name}</strong> responded to your request.</p>
          <div style="background:#f8f9fa; padding:15px; border-radius:8px;">
            <p><strong>Name:</strong> ${donor.name}</p>
            <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
            <p><strong>Phone:</strong> ${donor.phone}</p>
          </div>
          <p>Contact the donor directly to coordinate. 🙏</p>
        </div>
      `
    });

    // ── NEW: Save notification for requester ──
    await createNotification({
      userId: request.requestedBy,
      type: "donor_responded",
      title: "🎉 Donor Responded!",
      message: `${donor.name} (${donor.bloodGroup}) has responded to your blood request at ${request.hospital}`,
      requestId: request._id
    });

    res.json({
      msg: "Successfully responded to request",
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
// @access  Private (requester only)
// ─────────────────────────────────────
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    request.status = status;
    await request.save();

    res.json({ msg: `Request marked as ${status}`, request });

  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;

