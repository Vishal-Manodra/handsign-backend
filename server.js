require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://handsign-frontend.vercel.app'  // your actual deployed frontend URL
  ]
}));
app.use(express.json());

// 1. THE NEW SECURITY ROUTES
app.use('/api/auth', require('./routes/auth'));

// 2. THE UPGRADED SCORE SAVING API
app.post('/api/score', async (req, res) => {
  try {
    const { username, score } = req.body;
    // Find the securely logged-in user and update their XP
    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { $set: { "profile.totalXP": score } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/score/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    // Send back the XP if the user exists, otherwise send 0
    res.json({ highScore: user ? user.profile.totalXP : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));