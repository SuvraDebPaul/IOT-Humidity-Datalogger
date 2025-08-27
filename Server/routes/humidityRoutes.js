const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");
const humiController = require("../controllers/humidityController");

router.post("/live", checkAuth, humiController.updateLive);
router.post("/log", checkAuth, humiController.logData);
router.get("/live/:deviceId", checkAuth, humiController.getLive);
router.get("/log/:deviceId", checkAuth, humiController.getLogs);

module.exports = router;
