const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// 1. REGISTRATION ENDPOINT
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

    // Cryptography: "Salt" and Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({
      username,
      password: hashedPassword // Saving the scrambled version!
    });
    const savedUser = await newUser.save();

    // Generate the JWT "VIP Wristband"
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: { username: savedUser.username, xp: savedUser.profile.totalXP } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare the plain text password to the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a fresh JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Update their "last login" date
    user.profile.lastLogin = Date.now();
    await user.save();

    res.status(200).json({ 
      token, 
      user: { username: user.username, xp: user.profile.totalXP } 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;