const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/handsignDB";
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 Connected to MongoDB"))
  .catch(err => console.log("🔴 MongoDB Error:", err));

// Database Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  highScore: { type: Number, default: 0 }
});
const User = mongoose.model("User", userSchema);

// API Routes
app.get("/api/score/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json({ highScore: user ? user.highScore : 0 });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/score", async (req, res) => {
  const { username, score } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { username },
      { $max: { highScore: score } },
      { new: true, upsert: true }
    );
    res.json({ message: "Score saved!", highScore: user.highScore });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));