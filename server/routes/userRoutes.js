const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

/* ================================
   REGISTER USER
================================ */
router.post("/register", async (req, res) => {
  try {
    const {
      authId,
      name,
      phone,
      email,
      location,
      role,
      latitude,
      longitude,
    } = req.body;

    if (!authId || !name || !email) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    let can_request = false;
    let can_donate = false;
    let is_volunteer = false;

    switch (role) {
      case "Patient":
      case "Hospital":
        can_request = true;
        break;

      case "Donor":
        can_donate = true;
        break;

      case "Volunteer":
        is_volunteer = true;
        break;

      default:
        break;
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          auth_id: authId,
          name,
          phone,
          email,
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
      user: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================================
   GET USER
================================ */
router.get("/:authId", async (req, res) => {
  try {
    const { authId } = req.params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================================
   UPDATE USER PROFILE
================================ */
router.put("/update/:authId", async (req, res) => {
  try {
    const { authId } = req.params;

    const {
      name,
      phone,
      location,
      latitude,
      longitude,
    } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        phone,
        location,
        latitude,
        longitude,
      })
      .eq("auth_id", authId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================================
   DELETE ACCOUNT
================================ */
router.delete("/delete/:authId", async (req, res) => {
  try {
    const { authId } = req.params;

    // Remove donor record
    await supabase
      .from("donors")
      .delete()
      .eq("user_id", authId);

    // Remove blood requests
    await supabase
      .from("blood_requests")
      .delete()
      .eq("user_id", authId);

    // Remove notifications
    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", authId);

    // Remove user
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("auth_id", authId);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ================================
   GET ALL USERS
================================ */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;