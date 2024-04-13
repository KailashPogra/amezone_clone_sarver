const express = require("express");
const router = express.Router();
const Message = require("../models/save_chat");

// POST /api/messages
router.post("/api/messages", async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    // Save message to database
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
