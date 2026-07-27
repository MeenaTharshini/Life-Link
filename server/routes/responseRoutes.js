const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

/* =========================
   ACCEPT REQUEST
========================= */
router.post("/accept", async (req, res) => {
  try {
    const { donor_id, request_id, distance } = req.body;

    // 🔴 VALIDATION
    if (!donor_id || !request_id) {
      return res.status(400).json({
        error: "donor_id and request_id are required",
      });
    }

    /* =========================
       CHECK IF ALREADY RESPONDED
    ========================= */
    const { data: existing } = await supabase
      .from("request_responses")
      .select("*")
      .eq("donor_id", donor_id)
      .eq("request_id", request_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        error: "You already responded to this request",
      });
    }

    /* =========================
       INSERT RESPONSE (ACCEPTED)
    ========================= */
    const { data, error } = await supabase
      .from("request_responses")
      .insert([
        {
          donor_id,
          request_id,
          status: "accepted",
          distance: distance || null,
        },
      ])
      .select()
      .single();

    if (error) {
  console.log("INSERT ERROR");
  console.log(error);
  return res.status(500).json(error);
}

    return res.json({
      success: true,
      message: "Request accepted successfully",
      data,
    });

  } catch (err) {
  console.log("SERVER ERROR");
  console.log(err);

  res.status(500).json({
    error: err.message,
  });
}
});

/* =========================
   REJECT REQUEST
========================= */
router.post("/reject", async (req, res) => {
  try {
    const { donor_id, request_id } = req.body;

    // 🔴 VALIDATION
    if (!donor_id || !request_id) {
      return res.status(400).json({
        error: "donor_id and request_id are required",
      });
    }

    /* =========================
       CHECK IF ALREADY RESPONDED
    ========================= */
    const { data: existing } = await supabase
      .from("request_responses")
      .select("*")
      .eq("donor_id", donor_id)
      .eq("request_id", request_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        error: "You already responded to this request",
      });
    }

    /* =========================
       INSERT RESPONSE (REJECTED)
    ========================= */
    const { data, error } = await supabase
      .from("request_responses")
      .insert([
        {
          donor_id,
          request_id,
          status: "declined",
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("REJECT ERROR:", error);
      throw error;
    }

    return res.json({
      success: true,
      message: "Request declined successfully",
      data,
    });

  } catch (err) {
    console.log("REJECT ROUTE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET RESPONSES (OPTIONAL BUT USEFUL)
========================= */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("request_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
    console.log(error);
    return res.status(500).json(error);
}

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET BY DONOR
========================= */
router.get("/donor/:donorId", async (req, res) => {
  try {
    const { donorId } = req.params;

    const { data, error } = await supabase
      .from("request_responses")
      .select("*")
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (error) {
    console.log(error);
    return res.status(500).json(error);
}

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const { hospitalId } = req.params;

    // Get all requests created by this hospital
    const { data: requests, error: requestError } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (requestError) {
      return res.status(500).json(requestError);
    }

    const result = [];

    for (const request of requests) {

      // Get accepted responses for this request
      const { data: responses, error: responseError } = await supabase
        .from("request_responses")
        .select("*")
        .eq("request_id", request.id)
        .eq("status", "accepted");

      if (responseError) {
        return res.status(500).json(responseError);
      }

      const acceptedDonors = [];

      for (const response of responses || []) {

        // Fetch donor
        const { data: donor, error: donorError } = await supabase
          .from("donors")
          .select("*")
          .eq("id", response.donor_id)
          .single();

        if (donorError || !donor) {
          console.log("Donor Error:", donorError);
          continue;
        }

        // Fetch user details
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("name, phone")
          .eq("id", donor.user_id)
          .single();

        if (userError || !user) {
          console.log("User Error:", userError);
          continue;
        }

        acceptedDonors.push({
          id: donor.id,
          name: user.name,
          phone: user.phone,
          blood_group: donor.blood_group,
          latitude: donor.latitude,
          longitude: donor.longitude,
        });
      }

      result.push({
        blood_requests: request,
        accepted_donors: acceptedDonors,
      });
    }

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});
module.exports = router;