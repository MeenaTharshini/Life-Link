const supabase = require("../supabaseClient");
const compatibility = require("../utils/compatibility");
const getDistance = require("../utils/distance");
const {
  createAndSendNotifications,
} = require("./notificationService");

/**
 * START EMERGENCY BROADCAST
 */
async function startEmergency({ requestId }) {

  // -----------------------------
  // Get blood request
  // -----------------------------
  const { data: request, error: requestError } =
    await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .single();

  if (requestError) throw requestError;

  // Already active?
  if (request.emergency) {
    throw new Error("Emergency already active.");
  }

  // -----------------------------
  // Mark request as emergency
  // -----------------------------
  const { error: updateError } =
    await supabase
      .from("blood_requests")
      .update({
        emergency: true,
        broadcast_time: new Date().toISOString(),
      })
      .eq("id", requestId);

  if (updateError) throw updateError;

  // -----------------------------
  // Compatible blood groups
  // -----------------------------
  const compatibleGroups =
    compatibility[request.blood_group] || [];

  // -----------------------------
  // Available donors
  // -----------------------------
  const { data: donors, error: donorError } =
    await supabase
      .from("donors")
      .select("*")
      .eq("available", true)
      .in("blood_group", compatibleGroups);

  if (donorError) throw donorError;

  // -----------------------------
  // Find nearby donors
  // -----------------------------
  const nearbyDonors = donors
    .map((donor) => {

      const distance = getDistance(
        request.latitude,
        request.longitude,
        donor.latitude,
        donor.longitude
      );

      return {
        ...donor,
        distance,
      };

    })
    .filter(donor => donor.distance <= 20)
    .sort((a, b) => a.distance - b.distance);

  // -----------------------------
  // Create EMERGENCY notifications
  // -----------------------------
  if (nearbyDonors.length > 0) {

    await createAndSendNotifications({
    donors: nearbyDonors,
    request,
    emergency: true,
    popup_seen: false,
    alarm_played: false,
});

  }

  return {

    success: true,

    requestId,

    emergency: true,

    notifiedDonors: nearbyDonors.length,

  };

}

/**
 * CANCEL EMERGENCY
 */
async function cancelEmergency(requestId) {

  const { error } =
    await supabase
      .from("blood_requests")
      .update({
        emergency: false,
      })
      .eq("id", requestId);

  if (error) throw error;

}

/**
 * COMPLETE EMERGENCY
 */
async function completeEmergency(requestId) {

  const { error } =
    await supabase
      .from("blood_requests")
      .update({

        emergency: false,

        status: "completed",

        completed_time: new Date().toISOString(),

      })
      .eq("id", requestId);

  if (error) throw error;

}

/**
 * LIVE STATUS
 */
async function getEmergencyStatus(requestId) {

  const { data: request, error } =
    await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", requestId)
      .single();

  if (error) throw error;

  const { count: totalNotifications } =
    await supabase
      .from("notifications")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("request_id", requestId);

  const { count: acceptedDonors } =
    await supabase
      .from("notifications")
      .select("*", {
        head: true,
        count: "exact",
      })
      .eq("request_id", requestId)
      .eq("status", "accepted");

  return {

    request,

    totalNotifications: totalNotifications || 0,

    acceptedDonors: acceptedDonors || 0,

    emergency: request.emergency,

  };

}

module.exports = {

  startEmergency,

  cancelEmergency,

  completeEmergency,

  getEmergencyStatus,

};