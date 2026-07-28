const emergencyService = require("../service/emergencyService");

/**
 * START EMERGENCY BROADCAST
 * POST /api/emergency/start
 */
exports.startEmergency = async (req, res) => {
  try {
    const result = await emergencyService.startEmergency(req.body);

    return res.status(200).json({
      success: true,
      message: "Emergency broadcast started successfully.",
      data: result,
    });

  } catch (err) {

    console.error("Emergency Start Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unable to start emergency broadcast.",
    });

  }
};

/**
 * CANCEL EMERGENCY
 * POST /api/emergency/cancel/:requestId
 */
exports.cancelEmergency = async (req, res) => {
  try {

    const { requestId } = req.params;

    await emergencyService.cancelEmergency(requestId);

    return res.status(200).json({
      success: true,
      message: "Emergency cancelled successfully.",
    });

  } catch (err) {

    console.error("Emergency Cancel Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unable to cancel emergency.",
    });

  }
};

/**
 * COMPLETE EMERGENCY
 * POST /api/emergency/complete/:requestId
 */
exports.completeEmergency = async (req, res) => {
  try {

    const { requestId } = req.params;

    await emergencyService.completeEmergency(requestId);

    return res.status(200).json({
      success: true,
      message: "Emergency marked as completed.",
    });

  } catch (err) {

    console.error("Emergency Complete Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unable to complete emergency.",
    });

  }
};

/**
 * GET EMERGENCY STATUS
 * GET /api/emergency/status/:requestId
 */
exports.getEmergencyStatus = async (req, res) => {
  try {

    const { requestId } = req.params;

    const status = await emergencyService.getEmergencyStatus(requestId);

    return res.status(200).json({
      success: true,
      data: status,
    });

  } catch (err) {

    console.error("Emergency Status Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unable to fetch emergency status.",
    });

  }
};