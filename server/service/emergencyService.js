const supabase = require("../supabaseClient");
const compatibility = require("../utils/compatibility");
const getDistance = require("../utils/distance");
const {
  createAndSendNotifications,
} = require("./notificationService");

/**
 * Start Emergency Broadcast
 */
async function startEmergency(body) {
  const { requestId } = body;

  // Get request
  const { data: request, error: requestError } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError) throw requestError;

  // Update request
  const { error: updateError } = await supabase
    .from("blood_requests")
    .update({
      emergency: true,
      broadcast_time: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) throw updateError;

  // Compatible blood groups
  const compatibleGroups =
    compatibility[request.blood_group] || [];

  // Get available donors
  const { data: donors, error: donorError } =
    await supabase
      .from("donors")
      .select("*")
      .eq("available", true)
      .in("blood_group", compatibleGroups);

  if (donorError) throw donorError;

  // Filter nearby donors
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
    .filter((donor) => donor.distance <= 20) // 20 KM radius
    .sort((a, b) => a.distance - b.distance);

  // Create notifications
  if (nearbyDonors.length > 0) {
    await createAndSendNotifications({
      donors: nearbyDonors,
      request,
    });
  }

  return {
    notifiedDonors: nearbyDonors.length,
    requestId,
  };
}

/**
 * Cancel Emergency
 */
async function cancelEmergency(requestId) {
  const { error } = await supabase
    .from("blood_requests")
    .update({
  emergency: false,
})
    .eq("id", requestId);

  if (error) throw error;
}

/**
 * Complete Emergency
 */
async function completeEmergency(requestId) {
  const { error } = await supabase
    .from("blood_requests")
    .update({
      status: "completed",
      completed_time: new Date().toISOString(),
      emergency: false,
    })
    .eq("id", requestId);

  if (error) throw error;
}

/**
 * Live Status
 */
async function getEmergencyStatus(requestId) {
  const { data: request, error } = await supabase
    .from("blood_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (error) throw error;

  const { count } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("request_id", requestId);

  const { count: accepted } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("request_id", requestId)
    .eq("status", "accepted");

  return {
    request,
    totalNotifications: count || 0,
    acceptedDonors: accepted || 0,
  };
}

module.exports = {
  startEmergency,
  cancelEmergency,
  completeEmergency,
  getEmergencyStatus,
};