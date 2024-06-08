const express = require("express");
const router = express.Router();
const Message = require("../models/save_chat");
const jwt = require("jsonwebtoken");
// GET /api/chats/:senderId/:receiverId
router.get("/api/chats/", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ msg: "No auth token, access denied" });
    }

    const verified = jwt.verify(token, "passwordKey");

    if (!verified) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Find all messages between sender and receiver
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .select("senderId message -_id") // Select only senderId and message fields
      .sort({ createdAt: 1 });

    res.json({ success: true, messages: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
