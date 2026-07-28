import { useState, useEffect } from "react";
import axios from "axios";
import supabase from "../lib/supabaseClient";
import "./RegisterUser.css";

function RegisterUser() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    role: "Patient",
  });

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // get logged-in supabase user
  useEffect(() => {
    const getUser = async () => {
      const {
  data: { user },
} = await supabase.auth.getUser();

setUser(user);

if (!user) {
  setMessage("❌ Please login first");
}
    };

    getUser();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("❌ Not authenticated");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        "https://life-link-blood-network.onrender.com/api/users/register",
        {
          authId: user.id,
          name: form.name,
          phone: form.phone,
          email: user.email,
          location: form.location,
          role: form.role,
        }
      );

      setMessage("✅ Profile created successfully!");

      setForm({
        name: "",
        phone: "",
        location: "",
        role: "Patient",
      });

    } catch (err) {
      setMessage(
        err.response?.data?.error || "❌ Failed to create profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="premium-form-card">

        <h1>Complete Profile</h1>

        <form onSubmit={saveProfile}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="Patient">Patient</option>
            <option value="Hospital">Hospital</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Donor">Donor</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>

        </form>

        {message && <p>{message}</p>}

      </div>
    </div>
  );
}

export default RegisterUser;