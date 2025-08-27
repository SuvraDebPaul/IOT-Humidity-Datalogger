const HumiLive = require("../models/HumiLive");
const HumiLog = require("../models/HumiLogs");

function toBangladeshTime(date) {
  if (!date) return null;
  return new Date(date).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
}

// --- Live ---
exports.updateLive = async (req, res) => {
  const { deviceId, temperature, humidity, timestamp } = req.body;
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  try {
    const doc = await HumiLive.findOneAndUpdate(
      { deviceId },
      {
        temperature,
        humidity,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      { upsert: true, new: true }
    );
    res.json({ message: "Humidity live updated", data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Log ---
exports.logData = async (req, res) => {
  const { deviceId, temperature, humidity, timestamp } = req.body;
  if (!deviceId) return res.status(400).json({ error: "Missing deviceId" });

  try {
    const doc = await HumiLog.create({
      deviceId,
      temperature,
      humidity,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });
    res.status(201).json({ message: "Humidity logged", data: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Get Live ---
exports.getLive = async (req, res) => {
  try {
    const doc = await HumiLive.findOne({ deviceId: req.params.deviceId });
    if (!doc) return res.json({});
    res.json({
      deviceId: doc.deviceId,
      temperature: doc.temperature,
      humidity: doc.humidity,
      timestamp: toBangladeshTime(doc.timestamp),
      createdAt: toBangladeshTime(doc.createdAt),
      updatedAt: toBangladeshTime(doc.updatedAt),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Get Logs ---
exports.getLogs = async (req, res) => {
  try {
    const docs = await HumiLog.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(
      docs.map((doc) => ({
        deviceId: doc.deviceId,
        temperature: doc.temperature,
        humidity: doc.humidity,
        timestamp: toBangladeshTime(doc.timestamp),
        createdAt: toBangladeshTime(doc.createdAt),
        updatedAt: toBangladeshTime(doc.updatedAt),
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
