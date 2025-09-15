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
      default: 60000, // default interval in milliseconds
      min: 60000, // minimum value allowed in milliseconds means 1 minute
    },
    // You can add more configuration options here later
    // example:
    // threshold: Number,
    // mode: { type: String, enum: ["auto", "manual"], default: "auto" }
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Config", configSchema);
