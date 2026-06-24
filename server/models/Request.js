const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

  // Who made the request
  requestedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  // What blood group is needed
  bloodGroup: { 
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true
  },

  // Where blood is needed
  hospital: { 
    type: String, 
    required: true,
    trim: true
  },

  city: { 
    type: String, 
    required: true,
    trim: true
  },

  state: { 
    type: String, 
    required: true,
    trim: true
  },

  // Optional message from patient
  message: { 
    type: String,
    trim: true
  },

  // How urgent is it
  urgency: {
    type: String,
    enum: ["normal", "urgent", "critical"],
    default: "normal"
  },

  // Current status of request
  status: {
    type: String,
    enum: ["open", "fulfilled", "cancelled"],
    default: "open"
  },

  // List of donors who responded
  respondedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],

  // How many donors were notified
  donorsNotified: {
    type: Number,
    default: 0
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }

});

module.exports = mongoose.model("Request", requestSchema);