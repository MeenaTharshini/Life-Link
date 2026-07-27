import { useState } from "react";
import axios from "axios";
import "./SearchDonors.css";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Droplets,
  HeartHandshake,
  UserCircle2,
  LocateFixed,
  Activity,
  Clock3,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
function SearchDonors() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ];

  const searchDonors = async () => {
  if (!bloodGroup) {
    setError("Please select a blood group");
    return;
  }

  setLoading(true);
  setError("");
  setDonors([]);
  setSearched(true);

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const res = await axios.get(
          `https://life-link-blood-network.onrender.com/api/donors/nearby/${bloodGroup}`,
          {
            params: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          }
        );

        setDonors(res.data.donors || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
          "Unable to fetch donors."
        );
      }

      setLoading(false);
    },
    () => {
      setLoading(false);
      setError("Location permission denied.");
    }
  );
};

  return (
    <div className="search-page">

      {/* HERO */}
      <div className="search-hero">

    <div className="hero-icon">
        <HeartHandshake size={55}/>
    </div>

    <span className="search-badge">
        Life-Link Smart Search
    </span>

    <h1>
        Find Nearby Blood Donors
    </h1>

    <p>
        Search verified donors based on blood group,
        current location and availability.
    </p>

</div>

      {/* SEARCH CARD */}
      <div className="search-card">

    <label>
        <Droplets size={18}/>
        Select Blood Group
    </label>

        <div className="blood-grid">
          {bloodGroups.map((group) => (
            <button
              key={group}
              type="button"
              className={
                bloodGroup === group
                  ? "blood-pill active"
                  : "blood-pill"
              }
              onClick={() => setBloodGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>

        <button
className="search-btn"
onClick={searchDonors}
disabled={loading}
>

<Search size={20}/>

{loading ? "Searching..." : "Search Nearby Donors"}

</button>

        {error && <div className="error-box">
    <AlertTriangle size={18}/>
    <span>{error}</span>
</div>}

        {loading && (
          <div className="loading-box">

<Activity className="spin"/>

Searching nearby donors...

</div>
        )}
      </div>

      {/* RESULTS */}
      {!loading && donors.length > 0 && (
        <>
          <div className="result-header">

<h2>

<BadgeCheck/>

{donors.length} Donors Found

</h2>

<p>
Nearest verified donors
</p>

</div>
          <div className="results-grid">
            {donors.map((donor) => (
              <div
className="donor-card"
key={donor.id}
>

<div className="donor-top">

<div className="blood-circle">
    {donor.blood_group}
</div>
<div className="compatibility-badge">

  <ShieldCheck size={16}/>

  <span>{donor.compatibility}</span>

</div>
<div className="status-badge">

<BadgeCheck size={16}/>

Available

</div>

</div>

<div className="avatar">

<UserCircle2 size={75}/>

</div>

<h3>
{donor.users?.name || "Blood Donor"}
</h3>

<div className="info-list">

<div>

<Phone size={16}/>

<span>

{donor.users?.phone || "Not Available"}

</span>

</div>

<div>

<Mail size={16}/>

<span>

{donor.users?.email || "-"}

</span>

</div>

<div>

<MapPin size={16}/>

<span>

{donor.users?.location || "-"}

</span>

</div>

<div>

<LocateFixed size={16}/>

<span>

{donor.distance
  ? `${Number(donor.distance).toFixed(2)} km`
  : "Distance unavailable"}

</span>

</div>

<div>

<Clock3 size={16}/>

<span>

{donor.last_donated || "Never Donated"}

</span>

</div>

</div>

<a
href={`tel:${donor.users?.phone}`}
className="contact-btn"
>

<Phone size={18}/>

Call Donor

</a>

</div>
            ))}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!searched && !loading && donors.length === 0 && (
        <div className="empty-state">

<Search size={60}/>

<h3>

Search Nearby Blood Donors

</h3>

<p>

Select a blood group to discover verified donors near your current location.

</p>

</div>
      )}

      {/* NO RESULTS */}
      {searched && !loading && donors.length === 0 && !error && (
        <div className="no-results">

<Droplets size={55}/>

<h3>

No Matching Donors

</h3>

<p>

We couldn't find any available 

<b>{bloodGroup}</b>

 donors near your location.

</p>

</div>
      )}

    </div>
  );
}

export default SearchDonors;