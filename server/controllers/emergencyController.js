const emergencyService = require("../service/emergencyService");

/**
 * Start Emergency Broadcast
 * POST /api/emergency/start
 */
exports.startEmergency = async (req,res)=>{
  try {
    const result = await emergencyService.startEmergency(req.body);

    return res.status(200).json({
      success: true,
      message: "Emergency broadcast started.",
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
 * Cancel Emergency
 * POST /api/emergency/cancel
 */
exports.cancelEmergency = async (req, res) => {
  try {
    const { requestId } = req.params;

    await emergencyService.cancelEmergency(requestId);

    return res.json({
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
 * Complete Emergency
 * POST /api/emergency/complete
 */
exports.completeEmergency = async (req, res) => {
  try {
    const { requestId } = req.params;

    await emergencyService.completeEmergency(requestId);

    return res.json({
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
 * Get Live Emergency Status
 * GET /api/emergency/live/:requestId
 */
exports.getEmergencyStatus = async (req, res) => {
  try {
    const { requestId } = req.params;

    const status = await emergencyService.getEmergencyStatus(requestId);

    return res.json({
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