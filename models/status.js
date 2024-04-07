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
  location: {
    type: {
      type: String,
      enum: ["Point"], // Only allow "Point" type for location
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: true,
    },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index the location field as a 2dsphere index
statusSchema.index({ location: "2dsphere" });

const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
