const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/auth");
const tempController = require("../controllers/temperatureController");

router.post("/live", checkAuth, tempController.updateLive);
router.post("/log", checkAuth, tempController.logData);
router.get("/live/:deviceId", checkAuth, tempController.getLive);
router.get("/log/:deviceId", checkAuth, tempController.getLogs);

module.exports = router;
