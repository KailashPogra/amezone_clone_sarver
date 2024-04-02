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
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
