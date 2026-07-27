import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import axios from "axios";
import {
  HeartPulse,
  LocateFixed,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import "./Signup.css";
const API = import.meta.env.VITE_API_URL;
function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    latitude: null,
    longitude: null,
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
          );

          const address = res.data.address;

          const place =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            address.state_district ||
            address.state ||
            "Unknown Location";

          setForm((prev) => ({
            ...prev,
            location: place,
            latitude: lat,
            longitude: lon,
          }));
        } catch (err) {
          console.error(err);
          setMessage("Failed to fetch location.");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setMessage("Location permission denied.");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const signupUser = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Failed to create user.");
      }

      // Save user in your database
      await axios.post(
`${API}/api/users/register`,        {
          authId: data.user.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
        }
      );

      // Sign out after signup
      await supabase.auth.signOut();

      setMessage(" Account created successfully! Redirecting to Login...");

      setForm({
        name: "",
        phone: "",
        location: "",
        latitude: null,
        longitude: null,
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);

      if (
        err.message.includes("already") ||
        err.message.includes("registered")
      ) {
        setMessage(" This email is already registered.");
      } else {
        setMessage(
          err.response?.data?.error ||
          err.message ||
          "Signup failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="auth-container">
    <div className="auth-card">

      <div className="auth-logo">
        <HeartPulse
          size={48}
          strokeWidth={2.5}
        />
      </div>

      <h2>Create Account</h2>

      <p className="auth-subtitle">
        Join the Life-Link Blood Finder Network
      </p>

      <form onSubmit={signupUser}>

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
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <div className="location-section">

  <button
    type="button"
    className="locationBtn"
    onClick={getCurrentLocation}
    disabled={loadingLocation}
  >
    <LocateFixed size={18} />

    {loadingLocation
      ? "Getting Location..."
      : form.location
      ? "Location Captured"
      : "Get Current Location"}
  </button>

  {form.location && (
    <div className="location-box">
      <MapPin size={18} />

      <span>{form.location}</span>
    </div>
  )}

</div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        {message && (
          <div className="message-box error">
    <AlertTriangle size={18}/>
    <span>{message}</span>
</div>
        )}

      </form>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login">
          Login
        </Link>
      </div>

    </div>
  </div>
);
}

export default Signup;