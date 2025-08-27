const mongoose = require("mongoose");
const commonOptions = { timestamps: true };

const HumiLogSchema = new mongoose.Schema(
  { deviceId: String, temperature: Number, humidity: Number, timestamp: Date },
  commonOptions
);

module.exports = mongoose.model("HumiLog", HumiLogSchema, "humidity_logs");
