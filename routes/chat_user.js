const express = require("express");
const router = express.Router();
const Message = require("../models/save_chat");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// GET /api/user/chats/
router.get("/api/user/chats/", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ msg: "No auth token, access denied" });
    }

    const verified = jwt.verify(token, "passwordKey");
    if (!verified) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = verified.id;

    // Fetch user details (use `lean()` for better performance)
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Use aggregation to get the latest message per sender
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort messages by latest first
      },
      {
        $group: {
          _id: {
            sender: {
              $cond: [
                { $eq: ["$senderId", userId] },
                "$receiverId",
                "$senderId",
              ],
            },
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
        },
      },
    ]);

    // Extract unique sender IDs
    const senderIds = messages.map((m) => m._id.sender);

    // Fetch sender details in one query instead of multiple
    const senders = await User.find({ _id: { $in: senderIds } })
      .select("name profileImage")
      .lean();

    // Convert sender array to a map for quick lookup
    const senderMap = new Map(
      senders.map((sender) => [sender._id.toString(), sender])
    );

    // Build chatUsers array
    const chatUsers = messages
      .map((msg) => {
        const sender = senderMap.get(msg._id.sender.toString());
        return sender
          ? {
              userId: userId,
              name: sender.name,
              profileImage: sender.profileImage,
              lastMessage: msg.lastMessage,
              lastMessageTime: msg.lastMessageTime,
              senderId: msg._id.sender,
            }
          : null;
      })
      .filter(Boolean);

    res.json({
      success: true,
      user: {
        name: user.name,
        profileImage: user.profileImage,
        chatUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
