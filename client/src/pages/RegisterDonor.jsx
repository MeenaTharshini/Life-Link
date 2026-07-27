import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import {
  HeartHandshake,
  Droplets,
  MapPin,
  CheckCircle,
  Loader2,
} from "lucide-react";

import "./RegisterDonor.css";

function RegisterDonor() {
  const { authUser, profile } = useAuth();

  const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
  ];

  const [form, setForm] = useState({
    blood_group: "",
    latitude: "",
    longitude: "",
  });

  const [locationName, setLocationName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [locationLoaded, setLocationLoaded] =
    useState(false);

  const getLocation = () => {
  if (!navigator.geolocation) {
    setMessage("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);

        setForm((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lon,
        }));

        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`
        );

        const address = response.data.address;

        const place =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.county ||
          address.state_district ||
          address.state ||
          "Location Found";

        setLocationName(place);
        setLocationLoaded(true);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch location");
      }
    },
    (error) => {
      console.error(error);
      setMessage("Location permission denied");
    }
  );
};

  const registerDonor = async () => {
    try {
      if (!authUser?.id) {
        setMessage("Login required");
        return;
      }

      if (!form.blood_group) {
        setMessage(
          "Select your blood group"
        );
        return;
      }

      if (!locationLoaded) {
        setMessage(
          "Please fetch location"
        );
        return;
      }

      setLoading(true);
      setMessage("");

      await axios.post(
  "https://life-link-blood-network.onrender.com/api/donors/register",
  {
    authId: authUser.id,
    blood_group: form.blood_group,
    location: locationName,
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
  }
);

      setMessage(
        "✅ Donor Registered Successfully"
      );
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-page">
      <div className="donor-card">

        {/* HERO */}
<div className="search-hero">

  <div className="hero-icon">
    <HeartHandshake size={55} />
  </div>

  <span className="search-badge">
    Life-Link Donor Network
  </span>

  <h1>
    Become a Blood Donor
  </h1>

  <p>
    Register as a verified blood donor and help save lives
    by making yourself available for emergency blood requests
    in your nearby area.
  </p>

</div>

        <div className="eligibility-box">
          <CheckCircle size={18} />
          Available and ready to donate
        </div>

        <h3>Select Blood Group</h3>

        <div className="blood-grid">
          {bloodGroups.map((group) => (
            <button
              key={group}
              type="button"
              className={
                form.blood_group === group
                  ? "blood-btn active"
                  : "blood-btn"
              }
              onClick={() =>
                setForm({
                  ...form,
                  blood_group: group,
                })
              }
            >
              {group}
            </button>
          ))}
        </div>

        <button
          className="location-btn"
          onClick={getLocation}
        >
          <MapPin size={18} />
          {locationLoaded
            ? "Location Captured"
            : "Get Current Location"}
        </button>

        <div className="location-status">
  <MapPin size={18} />

  <span>
    {locationLoaded
      ? locationName
      : "Location not selected"}
  </span>
</div>

        <button
          className="register-btn"
          onClick={registerDonor}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Registering...
            </>
          ) : (
            "Register as Donor"
          )}
        </button>

        {message && (
          <div className="message-box">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}

export default RegisterDonor;