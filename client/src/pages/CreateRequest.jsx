import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./CreateRequest.css";
import {
  Droplets,
  MapPin,
  LocateFixed,
  AlertTriangle,
  Activity,
  Send,
  CheckCircle,
  HeartHandshake,
} from "lucide-react";
const API = import.meta.env.VITE_API_URL;
function CreateRequest() {
  const { profile } = useAuth();

  const [form, setForm] = useState({
    blood_group: "",
    urgency: "normal",
    units: 1,
  });

  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [address, setAddress] = useState("");


const getLocation = () => {
  setLoadingLoc(true);
  setMsg("");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({
        lat,
        lng,
      });

      try {
        // Get the application's current language.
        // Change this key if your app uses a different localStorage key.
        const selectedLanguage =
          localStorage.getItem("language") || "en";

        // Only allow the languages your application supports.
        const language =
          selectedLanguage === "ta" ? "ta" : "en";

        const res = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          {
            params: {
              format: "jsonv2",
              lat,
              lon: lng,
              "accept-language": language,
            },
          }
        );

        setAddress(
          res.data.display_name || "Location unavailable"
        );

      } catch (error) {
        console.error("LOCATION ERROR:", error);
        setAddress("Location unavailable");
      }

      setLoadingLoc(false);
    },

    (error) => {
      console.error("GEOLOCATION ERROR:", error);

      setMsg("Location permission denied");
      setLoadingLoc(false);
    }
  );
};


  const submitRequest = async () => {
  if (!form.blood_group || !location) {
    setMsg(" Fill all fields + location");
    return;
  }

  setSending(true);
  setMsg("");

  try {
    const res = await axios.post(
  `${API}/api/requests/create`,
      {
        hospital_id: profile.id,
        blood_group: form.blood_group,
        urgency: form.urgency,
        units: form.units,
        latitude: location.lat,
        longitude: location.lng,
        address: address,
      }
    );
    console.log("CREATE REQUEST RESPONSE:", res.data);

    setMsg(
  `Request created successfully! ${res.data.dispatched_to} donors notified`
);
  } catch (err) {
  console.log(err);

  setMsg(
    err.response?.data?.error ||
    err.message ||
    "Error sending request"
  );
} finally {
    setSending(false);
  }
};
  const startEmergency = async () => {

  if (!form.blood_group || !location) {
    setMsg("Fill all fields first.");
    return;
  }

  try {

    const requestRes = await axios.post(
      `${API}/api/requests/create`,
      {
        hospital_id: profile.id,
        blood_group: form.blood_group,
        urgency: form.urgency,
        units: form.units,
        latitude: location.lat,
        longitude: location.lng,
        address,
      }
    );

    console.log(
      "CREATE REQUEST RESPONSE:",
      requestRes.data
    );


    await axios.post(
      `${API}/api/emergency/start`,
      {
        requestId: requestRes.data.request.id,
      }
    );


    setMsg(
      "🚨 Emergency Broadcast Started Successfully!"
    );


  } catch (err) {

    console.log(
      "EMERGENCY ERROR:",
      err.response?.data
    );

    setMsg(
      err.response?.data?.error ||
      "Unable to start emergency."
    );

  }
};
  return (
    <div className="create-request-page">
      <div className="create-request-card">
        {/* HERO */}
<div className="search-hero">

  <div className="hero-icon">
    <HeartHandshake size={55} />
  </div>

  <span className="search-badge">
    Life-Link Smart Request
  </span>

  <h1>
    Create Emergency Blood Request
  </h1>

  <p>
    Instantly notify nearby compatible donors during
    emergency situations using smart location-based matching.
  </p>

</div>

        <label>Blood Group</label>
        <select onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
          <option value="">Select</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>O+</option>
          <option>O-</option>
          <option>AB-</option>
          <option>AB+</option>
        </select>

        <label>Urgency</label>
        <select onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="critical">Critical</option>
        </select>

        <label>Units</label>
        <input
          type="number"
          min="1"
          value={form.units}
          onChange={(e) => setForm({ ...form, units: e.target.value })}
        />

        <button onClick={getLocation} className="locationBtn">
  <LocateFixed size={18} />

  {loadingLoc
    ? "Getting Location..."
    : location
    ? "Location Captured"
    : "Get Current Location"}
</button>

        {location && (
address && (
<div className="location-box">
  <MapPin size={18} />
  <span>{address}</span>
</div>
)        )}

        <button
  className="sendBtn"
  onClick={submitRequest}
  disabled={sending}
>
  <Send size={18} />

  {sending ? "Sending..." : "Send Request"}
</button>

        {msg && (
  <div
    className={`message ${
      msg.includes("Request created")
        ? "success"
        : "error"
    }`}
  >
    {msg.includes("Request created") ? (
      <CheckCircle size={18} />
    ) : (
      <AlertTriangle size={18} />
    )}

    <span>
      {msg}
      </span>
  </div>
)}

      </div>
    </div>
  );
}

export default CreateRequest;