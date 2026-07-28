import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/**
 * Activate Emergency Mode
 */
export const activateEmergency = async (requestId) => {
  const res = await axios.post(
    `${API}/api/emergency/activate/${requestId}`
  );

  return res.data;
};

/**
 * Complete Emergency
 */
export const completeEmergency = async (requestId) => {
  const res = await axios.post(
    `${API}/api/emergency/complete/${requestId}`
  );

  return res.data;
};

/**
 * Get Live Emergency Status
 */
export const getEmergencyStatus = async (requestId) => {
  const res = await axios.get(
    `${API}/api/emergency/status/${requestId}`
  );

  return res.data;
};