const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 1. Core Identity
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true // Prevents "Vishal" and "vishal" from creating two accounts
  },
  
  // 2. Security
  password: { 
    type: String, 
    required: true // We will hash this with bcrypt in the next step!
  },

  // 3. Gamification Profile
  profile: {
    totalXP: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now }
  },

  // 4. Advanced AI Tracking (Sub-document Array)
  signMastery: [{
    signName: { type: String, required: true }, // e.g., "Thank You"
    attempts: { type: Number, default: 0 },
    successes: { type: Number, default: 0 }
  }]
}, 
// 5. Automatic Timestamps
{ timestamps: true }); 

module.exports = mongoose.model('User', userSchema);