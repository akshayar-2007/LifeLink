const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true          
   },
  email: { 
    type: String, 
    required: true, 
    unique: true,       
    lowercase: true,    
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
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],   
      default: [0, 0]
    }
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  lastDonated: { 
    type: Date,
    default: null
  },
  totalDonations: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

userSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("User", userSchema);