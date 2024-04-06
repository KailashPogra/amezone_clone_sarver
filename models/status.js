// status.js (Model Definition)
const mongoose = require("mongoose");

const statusSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  isOnline: {
    type: Boolean,
    required: true,
  },
  latitude: {
    type: Number, // Define latitude as a Number type
    required: true,
  },
  longitude: {
    type: Number, // Define longitude as a Number type
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
