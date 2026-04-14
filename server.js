const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. MongoDB Connection (Replace with your Atlas URI if you have one)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/handsignDB";
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Connected to MongoDB"))
  .catch(err => console.log("🔴 MongoDB Error:", err));

// 2. Database Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  highScore: { type: Number, default: 0 }
});
const User = mongoose.model("User", userSchema);

// 3. API Routes

// GET: Fetch a user's high score
app.get("/api/score/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({ highScore: user ? user.highScore : 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Update a user's high score
app.post("/api/score", async (req, res) => {
  const { username, score } = req.body;
  try {
    // Upsert: Find user, update score IF it's higher than current, or create new user
    const user = await User.findOneAndUpdate(
      { username },
      { $max: { highScore: score } }, // Only updates if new score is higher
      { new: true, upsert: true }
    );
    res.json({ message: "Score saved!", highScore: user.highScore });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

// 4. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));