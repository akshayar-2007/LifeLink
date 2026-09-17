const express = require("express");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────
// IMPORTANT: /read-all and /unread-count
// MUST come BEFORE /:id routes
// Otherwise "read-all" is treated as an :id
// ─────────────────────────────────────

// GET /api/notifications/unread-count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
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

// PUT /api/notifications/read-all
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
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

// GET /api/notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

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

// DELETE /api/notifications/all → clear all
// MUST come before /:id
router.delete("/all", authMiddleware, async (req, res) => {
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

// DELETE /api/notifications/:id
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

module.exports = router;