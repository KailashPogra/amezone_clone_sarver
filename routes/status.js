// authRouter.js (API Endpoint)
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Assuming you have a User model
const Status = require("../models/status");

const statusRouter = express.Router();

statusRouter.post("/api/status", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.json(false);
    }
    const { isOnline } = req.body; // Assuming token and status are sent in the request body

    // Verify JWT token
    const verified = jwt.verify(token, "passwordKey");

    // Find the user
    const user = await User.findById(verified.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user status
    const statusUpdate = await Status.findOneAndUpdate(
      { _id: "65fc33d15ecd26abd04411a8" },
      { isOnline: isOnline },
      { new: true, upsert: true }
    );

    res.json({ success: true, status: statusUpdate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET API endpoint to get the status of a user
statusRouter.get("/api/status", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.json({ msg: "authorization failed" });
    }
    const verified = jwt.verify(token, "passwordKey");
    const userId = await User.findById(verified.id);

    // Find the status of the user
    const userStatus = await Status.findOne({ userId });

    // If user status is found, return it
    if (userStatus) {
      res.json({ success: true, isOnline: userStatus.isOnline });
    } else {
      res.status(404).json({ error: "User status not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = statusRouter;
