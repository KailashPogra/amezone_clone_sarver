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
      return res.status(401).json({ msg: "No auth token, access denied" });
    }

    const verified = jwt.verify(token, "passwordKey");

    if (!verified) {
      return res
        .status(401)
        .json({ msg: "Token verification failed, access denied" });
    }

    // Create a GeoJSON object for the location
    const location = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Update the user's online status and location
    const statusUpdate = await Status.findOneAndUpdate(
      { _id: verified.id },
      { isOnline: isOnline, location: location },
      { new: true, upsert: true }
    );

    res.json({ success: true, status: statusUpdate });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

////////////////////////////////////////////////////////////////
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

    // Check if latitude and longitude are provided
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Parse latitude and longitude as floats
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Find nearby users within a certain distance (e.g., 10 kilometers)
    const nearbyUsers = await Status.find({
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat], // Longitude, Latitude
          },
          $maxDistance: 10000, // 10 kilometers in meters
        },
      },
      _id: { $ne: verified.id }, // Exclude the current user's ID
    })
      .populate("_id")
      .limit(10);

    if (nearbyUsers.length > 0) {
      const nearbyUserData = nearbyUsers.map((user) => ({
        _id: user._id._id,
        name: user._id.name,
        profileImage: user._id.profileImage,
      }));
      res.json({
        success: true,
        senderId: verified.id,
        nearbyUsers: nearbyUserData,
      });
    } else {
      res.status(404).json({ error: "No nearby users found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = statusRouter;
