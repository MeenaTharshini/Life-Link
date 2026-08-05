const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const getDistance = require("../utils/distance");
const { createAndSendNotifications,} = require("../service/notificationService");

/* ======================
   GET ALL
====================== */
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
});

/* ======================
   GET BY DONOR
====================== */
router.get("/donor/:donorId", async (req, res) => {
  const { donorId } = req.params;

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("donor_id", donorId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
});

/* ======================
   CREATE SINGLE
====================== */
router.post("/create", async (req, res) => {
  const payload = req.body;

  if (!payload.donor_id || !payload.request_id) {
    return res.status(400).json({ error: "donor_id & request_id required" });
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...payload,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, data });
});

/* ======================
   ACCEPT REQUEST
====================== */
router.put("/accept/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "accepted",
        is_read: true,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      console.error("ACCEPT ERROR:", error);

      return res.status(500).json({
        error: error.message,
      });
    }

    if (!data) {
      return res.status(400).json({
        error: "This request is no longer available for acceptance.",
      });
    }

    res.json({
      success: true,
      message: "Request accepted successfully.",
      data,
    });

  } catch (err) {
    console.error("ACCEPT ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ======================
   DONATION STARTED
====================== */
router.put("/donating/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "donating",
        donating_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "arrived")
      .select()
      .single();

    if (error) {
      console.error("DONATING ERROR:", error);

      return res.status(500).json({
        error: error.message,
      });
    }

    if (!data) {
      return res.status(400).json({
        error: "You must check in before starting the donation.",
      });
    }

    res.json({
      success: true,
      message: "Donation started.",
      data,
    });

  } catch (err) {
    console.error("DONATING ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
/* ======================
   DONOR ARRIVED
====================== */
router.put("/arrive/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "arrived",
        arrived_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "accepted")
      .select()
      .single();

    if (error) {
      console.error("ARRIVAL ERROR:", error);

      return res.status(500).json({
        error: error.message,
      });
    }

    if (!data) {
      return res.status(400).json({
        error: "You must accept the request before checking in.",
      });
    }

    res.json({
      success: true,
      message: "Arrival recorded successfully.",
      data,
    });

  } catch (err) {
    console.error("ARRIVAL ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});
/* ======================
   BROADCAST (OPTIONAL MANUAL)
====================== */
router.post("/broadcast", async (req, res) => {
  try {
    const {
      request_id,
      blood_group,
      urgency,
      latitude,
      longitude,
  hospital_id,
    } = req.body;

    const { data: request } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (!request) {
      return res.status(400).json({ error: "Invalid request_id" });
    }

    const { data: donors } = await supabase
.from("donors")
.select("*")
.eq("available", true)
.neq("id", request.hospital_id);

    if (!donors?.length) {
      return res.json({ success: true, sent_to: 0 });
    }

    const nearby = donors
.map(d=>{

 if(!d.latitude || !d.longitude)
 return null;


 const dist=getDistance(
 latitude,
 longitude,
 d.latitude,
 d.longitude
 );


 return {
    ...d,
    distance:dist
 };

})
.filter(
d=>d && d.distance<=10
);

    const inserted = await createAndSendNotifications({
      donors: nearby,
      request,
    });

    res.json({
      success: true,
      sent_to: inserted.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   MARK READ
====================== */
router.put("/read/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, data });
});

module.exports = router;