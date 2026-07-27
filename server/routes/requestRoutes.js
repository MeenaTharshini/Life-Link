const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const getDistance = require("../utils/distance");
const { createAndSendNotifications } = require("../service/notificationService");
const compatibility = require("../utils/compatibility");

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

  const valid = donors
  .filter(d => compatibility[blood_group]?.includes(d.blood_group))
.filter(d => String(d.user_id) !== String(hospital_id))
  .map(d => ({
    ...d,
    distance: getDistance(
      latitude,
      longitude,
      d.latitude,
      d.longitude
    ),
  }))
  .filter(d => d.distance <= 10)
  .slice(0, 20);

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
  console.dir(err, { depth: null });

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