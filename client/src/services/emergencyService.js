import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/**
 * Start Emergency Broadcast
 */
export const activateEmergency = async (requestId) => {
  try {
    const res = await axios.post(
      `${API}/api/emergency/start`,
      {
        requestId,
      }
    );

    return res.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: "Unable to start emergency broadcast.",
      }
    );
  }
};

/**
 * Cancel Emergency Broadcast
 */
export const cancelEmergency = async (requestId) => {
  try {
    const res = await axios.post(
      `${API}/api/emergency/cancel/${requestId}`
    );

    return res.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: "Unable to cancel emergency.",
      }
    );
  }
};

/**
 * Complete Emergency
 */
export const completeEmergency = async (requestId) => {
  try {
    const res = await axios.post(
      `${API}/api/emergency/complete/${requestId}`
    );

    return res.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: "Unable to complete emergency.",
      }
    );
  }
};

/**
 * Get Live Emergency Status
 */
export const getEmergencyStatus = async (requestId) => {
  try {
    const res = await axios.get(
      `${API}/api/emergency/status/${requestId}`
    );

    return res.data;
  } catch (err) {
    throw (
      err.response?.data || {
        success: false,
        message: "Unable to fetch emergency status.",
      }
    );
  }
};