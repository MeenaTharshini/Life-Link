import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Heart,
  Droplets,
  ShieldCheck,
  Users,
  HandHeart,
} from "lucide-react";

import "./Profile.css";

const API = import.meta.env.VITE_API_URL;

function Profile() {
  const { authUser, profile } = useAuth();

  const [stats, setStats] = useState({
    requests: 0,
    acceptedRequests: 0,
    isDonor: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    console.log("Supabase Auth ID:", authUser?.id);
    console.log("Database User ID:", profile?.id);

    const loadProfile = async () => {
      try {
        const { data } = await axios.get(
          `${API}/api/profile/${profile.id}`
        );

        setStats({
          requests: data.requests || 0,
          acceptedRequests: data.acceptedRequests || 0,
          isDonor: data.isDonor || false,
        });
      } catch (err) {
        console.error("Profile API Error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profile, authUser]);

  let role = "";
  let badgeColor = "";

  if (stats.isDonor) {
    if (stats.acceptedRequests >= 25) {
      role = "🏆 Platinum Lifesaver";
      badgeColor = "platinum";
    } else if (stats.acceptedRequests >= 10) {
      role = "🥇 Golden Blood Hero";
      badgeColor = "gold";
    } else if (stats.acceptedRequests >= 5) {
      role = "🥈 Silver Lifeline";
      badgeColor = "silver";
    } else {
      role = "❤️ Blood Hero";
      badgeColor = "red";
    }
  } else if (profile?.is_volunteer) {
    role = "🤝 Community Volunteer";
    badgeColor = "green";
  } else {
    if (stats.requests >= 5) {
      role = "💙 Life Saver Supporter";
      badgeColor = "blue";
    } else {
      role = "👤 Community Member";
      badgeColor = "gray";
    }
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-header">
          <UserCircle size={120} className="profile-avatar" />

          <h1>{profile.name}</h1>

          <div className="profile-role">
            {stats.isDonor ? (
              <>
                <Heart size={16} />
                Verified Blood Donor
              </>
            ) : profile.is_volunteer ? (
              <>
                <HandHeart size={16} />
                Volunteer
              </>
            ) : (
              <>
                <Users size={16} />
                Life-Link Member
              </>
            )}
          </div>

          <div className={`status-badge ${badgeColor}`}>
            <ShieldCheck size={16} />
            {role}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <Heart size={28} />
            <h2>{loading ? "..." : stats.requests}</h2>
            <p>Blood Requests</p>
          </div>

          <div className="stat-card">
            <Droplets size={28} />
            <h2>{loading ? "..." : stats.acceptedRequests}</h2>
            <p>Accepted Donations</p>
          </div>
        </div>

        <div className="info-section">
          <h2>Contact Information</h2>

          <div className="info-row">
            <Mail size={18} />
            <span>{authUser?.email}</span>
          </div>

          <div className="info-row">
            <Phone size={18} />
            <span>{profile.phone || "Not Available"}</span>
          </div>

          <div className="info-row">
            <MapPin size={18} />
            <span>{profile.location || "Not Available"}</span>
          </div>
        </div>

        <div className="impact-box">
          <Heart size={24} className="impact-icon" />

          <div>
            <h3>Life-Link Impact</h3>

            <p>
              {stats.isDonor
                ? `Thank you for being part of our donor network. You have accepted ${stats.acceptedRequests} blood request(s) and have the potential to help approximately ${
                    stats.acceptedRequests * 3
                  } lives.`
                : "Become a registered donor and help save lives during emergency blood requests."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;