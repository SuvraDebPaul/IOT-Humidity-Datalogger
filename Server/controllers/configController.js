const Config = require("../models/Config");

// --- Get Device Config ---
exports.getConfig = async (req, res) => {
  try {
    let cfg = await Config.findOne({ deviceId: req.params.deviceId });
    if (!cfg) {
      cfg = await Config.create({ deviceId: req.params.deviceId });
    }
    res.json(cfg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Update Device Config ---
exports.updateConfig = async (req, res) => {
  try {
    const { loggingInterval } = req.body;

    if (loggingInterval && typeof loggingInterval !== "number") {
      return res
        .status(400)
        .json({ error: "loggingInterval must be a number" });
    }

    const cfg = await Config.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { loggingInterval },
      { new: true, upsert: true }
    );

    res.json(cfg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
