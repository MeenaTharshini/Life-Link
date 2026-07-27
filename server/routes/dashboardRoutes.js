const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

/* ================================
   DASHBOARD STATS
================================ */
router.get("/stats", async (req, res) => {
  try {
    const usersRes = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const donorsRes = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true });

    const reqRes = await supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true });

    const notifyRes = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true });

    return res.json({
      users: usersRes.count || 0,
      donors: donorsRes.count || 0,
      requests: reqRes.count || 0,
      notifications: notifyRes.count || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   BLOOD REQUEST TREND (GRAPH)
================================ */
router.get("/blood-trends", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("created_at");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.json([]);
    }

    const map = {};

    data.forEach((item) => {
      const date = new Date(item.created_at);
      const month = date.toLocaleString("default", {
        month: "short",
      });

      map[month] = (map[month] || 0) + 1;
    });

    const result = Object.entries(map).map(
      ([month, requests]) => ({
        month,
        requests,
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;