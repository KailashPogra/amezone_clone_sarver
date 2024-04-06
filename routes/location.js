const Location = require("../models/location");

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Status = require("../models/status");

const locationRouter = express.Router();

// Route for getting the nearest location
locationRouter.post("/nearest", auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Find the nearest location in the database
    const nearestLocation = await Location.findOne({
      $and: [
        { latitude: { $gte: latitude - 1, $lte: latitude + 1 } },
        { longitude: { $gte: longitude - 1, $lte: longitude + 1 } },
      ],
    }).sort({
      $sqrt: {
        $add: [
          { $pow: [{ $subtract: ["$latitude", latitude] }, 2] },
          { $pow: [{ $subtract: ["$longitude", longitude] }, 2] },
        ],
      },
    });

    if (!nearestLocation) {
      return res.status(404).json({ msg: "No nearby location found" });
    }

    res.json(nearestLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
