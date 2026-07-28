const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    /* ---------------- USER ---------------- */

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /* ---------------- BLOOD REQUESTS CREATED ---------------- */

    const { count: requestCount, error: requestError } = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .eq("hospital_id", userId);

    if (requestError) throw requestError;

    /* ---------------- DONOR DETAILS ---------------- */

    const { data: donor, error: donorError } = await supabase
      .from("donors")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (donorError) throw donorError;

    let acceptedRequests = 0;

if (donor) {
  const { count, error } = await supabase
    .from("request_responses")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("donor_id", donor.id)
    .eq("status", "accepted");

  if (error) throw error;

  acceptedRequests = count || 0;
}

    /* ---------------- RESPONSE ---------------- */

    res.status(200).json({
      success: true,

      user,

      requests: requestCount || 0,

      acceptedRequests,

      isDonor: !!donor,

      donor: donor || null,
    });

  } catch (err) {

    
    res.status(500).json({
      success: false,
      error: err.message,
    });

  }
});

module.exports = router;