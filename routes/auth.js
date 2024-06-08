const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const auth = require("../middlewares/auth");

const authRouter = express.Router();

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Define the destination folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  },
});
const upload = multer({ storage: storage });

authRouter.post(
  "/api/signup",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const { path } = req.file;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ msg: "user with same email already exists!" });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      let user = new User({
        email,
        password: hashPassword,
        name,
        profileImage: path,
      });
      const token = jwt.sign({ id: user._id }, "passwordKey");
      user = await user.save();
      res.json({ ...user._doc, token: token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

//Sign-In routes
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        msg: "user with this email not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password." });
    }
    const token = jwt.sign({ id: user._id }, "passwordKey", {
      expiresIn: "5m",
    });

    res.json({ ...user._doc, token: token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, "passwordKey");
    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }
    res.json(true);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
