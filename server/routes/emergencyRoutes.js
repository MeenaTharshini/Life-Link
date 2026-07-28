const express = require("express");
const router = express.Router();

const {
  startEmergency,
  activateEmergency,
  completeEmergency,
  getEmergencyStatus,
} = require("../controllers/emergencyController");


// Frontend uses this
router.post("/start", startEmergency);


// Existing routes
router.post("/activate/:requestId", activateEmergency);

router.post("/complete/:requestId", completeEmergency);

router.get("/status/:requestId", getEmergencyStatus);


module.exports = router;