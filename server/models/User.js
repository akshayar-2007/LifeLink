const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  
  // Basic Info
  name: { 
    type: String, 
    required: true,
    trim: true          // removes extra spaces
  },
  
  email: { 
    type: String, 
    required: true, 
    unique: true,       // no two users same email
    lowercase: true,    // saves as lowercase always
    trim: true
  },
  
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  
  phone: { 
    type: String, 
    required: true 
  },

  // Blood Donor Specific Info
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true
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

  // Location coordinates for map search
  // We will use this on Day 3
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      default: [0, 0]
    }
  },

  // Donor availability
  // true = willing to donate
  // false = not available right now
  isAvailable: { 
    type: Boolean, 
    default: true 
  },

  // When did they last donate blood
  lastDonated: { 
    type: Date,
    default: null
  },

  // How many times donated total
  totalDonations: { 
    type: Number, 
    default: 0 
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }

});

// This index enables location based search
// 2dsphere = works with real world coordinates
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);