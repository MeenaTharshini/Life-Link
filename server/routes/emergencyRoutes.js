const express = require("express");
const router = express.Router();

const {
  startEmergency,
  cancelEmergency,
  completeEmergency,
  getEmergencyStatus,
} = require("../controllers/emergencyController");

/**
 * START EMERGENCY BROADCAST
 * POST /api/emergency/start
 */
router.post("/start", startEmergency);

/**
 * CANCEL EMERGENCY
 * POST /api/emergency/cancel/:requestId
 */
router.post("/cancel/:requestId", cancelEmergency);

/**
 * COMPLETE EMERGENCY
 * POST /api/emergency/complete/:requestId
 */
router.post("/complete/:requestId", completeEmergency);

/**
 * GET LIVE EMERGENCY STATUS
 * GET /api/emergency/status/:requestId
 */
router.get("/status/:requestId", getEmergencyStatus);

module.exports = router;