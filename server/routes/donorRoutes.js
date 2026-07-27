const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const compatibility = require("../utils/compatibility");
const getDistance = require("../utils/distance");
/* REGISTER DONOR */
router.post("/register", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

const {
    authId,
    blood_group,
    location,
    latitude,
    longitude,
} = req.body;

console.log("Searching auth_id =", authId);

const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

console.log(user);
console.log(userError);

    if (userError || !user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Already donor?
    const { data: existing } = await supabase
      .from("donors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        error: "Already registered as donor",
      });
    }

    const { data, error } = await supabase
      .from("donors")
      .insert([
        {
          user_id: user.id,
          blood_group,
          location,
          latitude,
          longitude,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      donor: data,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* GET DONOR */
router.get("/by-user/:authId", async (req, res) => {
  const { authId } = req.params;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (userError || !user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { data: donor, error: donorError } = await supabase
    .from("donors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (donorError || !donor) {
    return res.status(404).json({ error: "Donor not found" });
  }

  res.json(donor);
});
router.get("/nearby/:bloodGroup", async (req, res) => {

  const { bloodGroup } = req.params;
  const { latitude, longitude } = req.query;

  // Compatible donor blood groups
  const compatibleGroups = compatibility[bloodGroup] || [];

  const { data: donors, error } = await supabase
    .from("donors")
    .select("*")
    .in("blood_group", compatibleGroups)
    .eq("available", true);

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  const userIds = donors.map(d => d.user_id);

  const { data: users } = await supabase
    .from("users")
    .select("id,name,email,phone,location")
    .in("id", userIds);

  const result = donors
    .map(donor => {

      const distance = getDistance(
        Number(latitude),
        Number(longitude),
        donor.latitude,
        donor.longitude
      );

      return {
        ...donor,
        distance,
        compatibility:
          donor.blood_group === bloodGroup
            ? "Exact Match"
            : "Compatible Match",

        users: users.find(
          u => u.id === donor.user_id
        ),
      };

    })
    .sort((a, b) => {

      // Exact matches first

      if (
        a.compatibility === "Exact Match" &&
        b.compatibility !== "Exact Match"
      )
        return -1;

      if (
        a.compatibility !== "Exact Match" &&
        b.compatibility === "Exact Match"
      )
        return 1;

      // Then nearest

      return a.distance - b.distance;

    });

  res.json({
    donors: result,
  });

});
module.exports = router;