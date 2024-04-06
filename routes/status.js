const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Status = require("../models/status");

const statusRouter = express.Router();

// POST API endpoint to update user's online status and location
statusRouter.post("/api/status", async (req, res) => {
  try {
    const { isOnline, latitude, longitude } = req.body;
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ msg: "No auth token , access denied" });
    }
    const verified = jwt.verify(token, "passwordKey");

    if (!verified) {
      return res
        .status(401)
        .json({ msg: "token verification failed , access denied" });
    }

    const statusUpdate = await Status.findOneAndUpdate(
      { _id: verified.id },
      { isOnline: isOnline, latitude: latitude, longitude: longitude },
      { new: true, upsert: true }
    );

    res.json({ success: true, status: statusUpdate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET API endpoint to get nearby users based on latitude and longitude
statusRouter.get("/api/nearbyusers", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ msg: "No auth token , access denied" });
    }
    const verified = jwt.verify(token, "passwordKey");

    if (!verified) {
      return res
        .status(401)
        .json({ msg: "token verification failed , access denied" });
    }

    // Parse latitude and longitude as numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Find nearby users who are online and limit the result to 10 users
    const nearbyUsers = await Status.find({
      isOnline: true,
      latitude: { $gt: lat - 10, $lt: lat + 10 },
      longitude: { $gt: lng - 10, $lt: lng + 10 },
      _id: { $ne: verified.id }, // Exclude the current user's ID
    })
      .populate("_id")
      .limit(10);

    if (nearbyUsers.length > 0) {
      const nearbyUserData = nearbyUsers.map((user) => ({
        // location: { latitude: user.latitude, longitude: user.longitude },
        userData: user._id,
      }));
      res.json({ success: true, nearbyUsers: nearbyUserData });
    } else {
      res.status(404).json({ error: "No nearby users found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = statusRouter;
