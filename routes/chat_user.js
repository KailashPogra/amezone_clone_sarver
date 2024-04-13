const express = require("express");
const router = express.Router();
const Message = require("../models/save_chat");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
// GET /api/user/chats/:userId
router.get("/api/user/chats/", async (req, res) => {
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

    const userId = verified.id;
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Retrieve messages where the user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ receiverId: userId }, { senderId: userId }],
    }).sort({ createdAt: -1 });

    // Create a map to store the last message for each sender
    const lastMessages = new Map();

    // Iterate through messages to find the last message for each sender
    for (const message of messages) {
      const senderId =
        message.senderId.toString() === userId
          ? message.receiverId
          : message.senderId;

      // Check if the lastMessages map already contains an entry for the sender
      if (
        !lastMessages.has(senderId.toString()) ||
        message.createdAt > lastMessages.get(senderId.toString()).createdAt
      ) {
        lastMessages.set(senderId.toString(), message);
      }
    }

    // Create an array to store user details with the last message
    const chatUsers = [];

    // Iterate through unique sender IDs and populate chatUsers array
    for (const [senderId, message] of lastMessages.entries()) {
      // Find sender by ID
      const sender = await User.findById(senderId);
      if (sender) {
        // Push sender details along with the last message to chatUsers array
        chatUsers.push({
          userId: verified.id,
          name: sender.name,
          profileImage: sender.profileImage,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          senderId: senderId,
        });
      }
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        profileImage: user.profileImage,
        chatUsers: chatUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
