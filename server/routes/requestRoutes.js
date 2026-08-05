const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { createAndSendNotifications } = require("../service/notificationService");
const { findMatchingDonors } = require("../utils/donorMatcher");
router.post("/create", async (req, res) => {
  const {
    hospital_id,
    blood_group,
    urgency,
    units,
    latitude,
    longitude,
    address,
  } = req.body;

  const { data: request, error: requestError } = await supabase
  .from("blood_requests")
  .insert([
    {
      hospital_id,
      blood_group,
      urgency,
      units,
      latitude,
      longitude,
      address,
      created_at: new Date().toISOString(),
    },
  ])
  .select()
  .single();

if (requestError) {
  console.log(requestError);
  return res.status(500).json({ error: requestError.message });
}
    const { data: hospital, error: hospitalError } = await supabase
    .from("users")
    .select("name, phone")
    .eq("id", hospital_id)
    .single();

  if (hospitalError) {
    return res.status(500).json({ error: hospitalError.message });
  }

  const { data: donors, error: donorError } = await supabase
  .from("donors")
  .select("*");

if (donorError) {
  console.log(donorError);
  return res.status(500).json({ error: donorError.message });
}

  const valid = findMatchingDonors({
  donors,
  bloodGroup: blood_group,
  latitude,
  longitude,
  urgency,
  requesterId: hospital_id,
  requiredDonors: Math.max(5, Number(units) * 3),
});

  const requestWithRequester = {
    ...request,
    requester_name: hospital.name,
    requester_phone: hospital.phone,
  };

  try {
  await createAndSendNotifications({
  donors: valid,
  request: requestWithRequester,
});

res.json({
  success: true,
  dispatched_to: valid.length,
  request: requestWithRequester,
});

} catch (err) {
  console.log("NOTIFICATION ERROR:");

  return res.status(500).json({
    error: err.message,
  });
}
});
router.delete("/:requestId", async (req, res) => {

  const { requestId } = req.params;

  try {

    // Delete notifications first
    await supabase
      .from("notifications")
      .delete()
      .eq("request_id", requestId);

    // Delete donor responses
    

    // Delete blood request
    const { error } = await supabase
      .from("blood_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      success: true,
    });

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }

});
module.exports = router;