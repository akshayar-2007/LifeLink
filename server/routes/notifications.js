const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ─────────────────────────────────────
// @route   GET /api/notifications
// @desc    Get my notifications
// @access  Private
// ─────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id 
    })
    .sort({ createdAt: -1 })  // newest first
    .limit(30);               // last 30 notifications

    res.json({
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
// ─────────────────────────────────────
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    // countDocuments is faster than find()
    // when you only need the count
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({ unreadCount: count });

  } catch (error) {
    console.error("Unread count error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   PUT /api/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
// ─────────────────────────────────────
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Make sure user owns this notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ 
      msg: "Notification marked as read",
      notification 
    });

  } catch (error) {
    console.error("Mark read error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   PUT /api/notifications/read-all
// @desc    Mark ALL notifications as read
// @access  Private
// ─────────────────────────────────────
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    // updateMany updates multiple documents at once
    // Much faster than updating one by one
    const result = await Notification.updateMany(
      { 
        userId: req.user.id,
        isRead: false          // only update unread ones
      },
      { 
        $set: { isRead: true } 
      }
    );

    res.json({ 
      msg: "All notifications marked as read",
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Read all error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
// ─────────────────────────────────────
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await notification.deleteOne();

    res.json({ msg: "Notification deleted" });

  } catch (error) {
    console.error("Delete notification error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// ─────────────────────────────────────
// @route   DELETE /api/notifications
// @desc    Delete ALL my notifications
// @access  Private
// ─────────────────────────────────────
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ 
      userId: req.user.id 
    });

    res.json({ 
      msg: "All notifications deleted",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Delete all error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;