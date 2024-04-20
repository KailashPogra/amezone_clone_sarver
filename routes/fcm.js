const express = require("express");
const router = express.Router();
const Fcm = require("../models/fcm");
const jwt = require("jsonwebtoken");
// Save or update FCM token
router.post("/api/fcmToken", async (req, res) => {
  try {
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

    const { fcmToken } = req.body;
    if (fcmToken == null) {
      res.status(404).json({ success: false, msg: "fcm required" });
    }

    // Use findOneAndUpdate to find an existing document or create a new one
    let data = await Fcm.findOneAndUpdate(
      { userId: verified.id },
      { fcmToken: fcmToken },
      { new: true, upsert: true } // Options to return the updated document and create if it doesn't exist
    );
    res
      .status(200)
      .json({ success: true, message: "Token saved successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retrieve FCM token by ID
router.get("/api/fcmToken", async (req, res) => {
  try {
    const { userId } = req.query;
    const token = await Fcm.findOne({ userId }, { fcmToken: 1, _id: 0 });
    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: "Token not found" });
    }
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
