const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");
const configController = require("../controllers/configController");

// Get device config
router.get("/:deviceId", checkAuth, configController.getConfig);

// Update device config
router.post("/:deviceId", checkAuth, configController.updateConfig);

module.exports = router;
