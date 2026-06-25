const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

  // Who receives this notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // What type of notification
  type: {
    type: String,
    enum: [
      "new_request",    // new blood request in your area
      "donor_responded", // donor responded to your request
      "request_fulfilled", // your request was fulfilled
      "system"          // general system message
    ],
    required: true
  },

  // Notification title
  title: {
    type: String,
    required: true
  },

  // Notification message
  message: {
    type: String,
    required: true
  },

  // Link to related request (optional)
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    default: null
  },

  // Has user seen this notification
  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Notification", notificationSchema);