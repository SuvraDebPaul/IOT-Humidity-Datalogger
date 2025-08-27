const mongoose = require("mongoose");
const commonOptions = { timestamps: true };

const TempLogSchema = new mongoose.Schema(
  { deviceId: String, temperature: Number, humidity: Number, timestamp: Date },
  commonOptions
);

module.exports = mongoose.model("TempLog", TempLogSchema, "temperature_logs");
