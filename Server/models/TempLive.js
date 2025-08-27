const mongoose = require("mongoose");
const commonOptions = { timestamps: true };

const TempLiveSchema = new mongoose.Schema(
  { deviceId: String, temperature: Number, humidity: Number, timestamp: Date },
  commonOptions
);

module.exports = mongoose.model("TempLive", TempLiveSchema, "temperature_live");
