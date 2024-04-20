const mongoose = require("mongoose");

const fcmSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  fcmToken: {
    type: String,
    required: true,
  },
});

const Fcm = mongoose.model("Fcm", fcmSchema);

module.exports = Fcm;
