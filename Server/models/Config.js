// models/Config.js
const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true, // ensures one config per device
      trim: true,
    },
    loggingInterval: {
      type: Number,
      default: 60, // default interval in seconds
      min: 60,      // minimum value allowed
    },
    // You can add more configuration options here later
    // example:
    // threshold: Number,
    // mode: { type: String, enum: ["auto", "manual"], default: "auto" }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Config", configSchema);
