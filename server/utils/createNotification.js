const Notification = require("../models/Notification");

// ─────────────────────────────────────
// Create a single notification
// ─────────────────────────────────────
const createNotification = async ({ 
  userId, 
  type, 
  title, 
  message, 
  requestId = null 
}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      requestId
    });

    await notification.save();
    return notification;

  } catch (error) {
    // Don't crash app if notification fails
    console.error("Create notification error:", error.message);
    return null;
  }
};


// ─────────────────────────────────────
// Create notifications for multiple users
// (when request is made — notify all donors)
// ─────────────────────────────────────
const createBulkNotifications = async ({ 
  userIds,    // array of donor IDs
  type, 
  title, 
  message, 
  requestId 
}) => {
  try {
    // Build array of notification objects
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      requestId
    }));

    // insertMany is faster than saving one by one
    // Like Promise.all but for database inserts
    await Notification.insertMany(notifications);
    
    console.log(`✅ ${notifications.length} notifications created`);

  } catch (error) {
    console.error("Bulk notification error:", error.message);
  }
};


module.exports = { createNotification, createBulkNotifications };