const mongoose = require("mongoose");
const commonOptions = { timestamps: true };

const HumiLiveSchema = new mongoose.Schema(
  { deviceId: String, temperature: Number, humidity: Number, timestamp: Date },
  commonOptions
);

module.exports = mongoose.model("HumiLive", HumiLiveSchema, "humidity_live");
