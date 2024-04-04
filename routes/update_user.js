const jwt = require("jsonwebtoken");
const express = require("express");
const User = require("../models/user");
const fs = require("fs");
const multer = require("multer");
const updateRouter = express.Router();

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Define the destination folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Append a unique suff
  },
});
const upload = multer({ storage: storage });

updateRouter.put(
  "/api/user/update",
  upload.single("profileImage"),
  async (req, res) => {
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

      const userId = verified.id; // Assuming your JWT payload contains user ID

      const { name, email } = req.body;
      const profileImage = req.file ? req.file.path : undefined;

      // Find the user by ID
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      // Delete previous profile image if it exists
      if (profileImage != null) {
        fs.unlinkSync(user.profileImage);
      }

      // Update user data
      user.name = name || user.name;
      user.email = email || user.email;

      if (profileImage) {
        user.profileImage = profileImage;
      }

      // Save updated user data
      user = await user.save();

      return res.json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);
module.exports = updateRouter;
