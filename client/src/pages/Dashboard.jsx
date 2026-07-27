import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  MapPinned,
  Users,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { canRequest, canDonate } = useAuth();

  const [stats, setStats] = useState({
    users: 0,
    donors: 0,
    requests:0,
  });

  // Fetch dashboard stats
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard/stats")
      .then((res) => {
        setStats({
  users: res.data.users || 0,
  donors: res.data.donors || 0,
  requests: res.data.requests || 0,
});
      })
      .catch((err) =>
        console.error("Failed to fetch dashboard stats:", err)
      );
  }, []);

  const features = [
    {
      icon: <HeartPulse size={40} />,
      title: "Smart Matching",
      desc: "Finds compatible donors automatically.",
    },
    {
      icon: <MapPinned size={40} />,
      title: "Location Based Search",
      desc: "Find nearest donors instantly.",
    },
    {
      icon: <Users size={40} />,
      title: "Verified Community",
      desc: "Connect with trusted registered donors.",
    },
  ];

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge">
            Emergency Blood Network
          </span>

          <h1 className="hero-title">
            Save Lives Instantly With Smart Matching
          </h1>

          <p className="hero-subtitle">
            Connect with nearby blood donors during emergencies and help save lives.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => navigate("/search")}
            >
              Find Donors
            </button>

            {canRequest && (
              <button
                className="secondary-btn"
                onClick={() => navigate("/blood-request")}
              >
                Create Request
              </button>
            )}

            {canDonate && (
              <button
                className="secondary-btn"
                onClick={() => navigate("/nearby-requests")}
              >
                View Requests
              </button>
            )}

          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">

          <div className="stat-card">
            <HeartPulse size={32} />
            <h2>{stats.donors}</h2>
            <p>Registered Donors</p>
          </div>

          <div className="stat-card">
            <Users size={32} />
            <h2>{stats.users}</h2>
            <p>Registered Users</p>
          </div>

          <div className="stat-card">
  <Activity size={32} />
  <h2>{stats.requests}</h2>
  <p>Blood Requests Sent</p>
</div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            {feature.icon}
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="process-section">
        <h2>How It Works</h2>

        <div className="process-grid">

          <div className="step-card">
            <h3>1. Register</h3>
            <p>Create your account and complete your profile.</p>
          </div>

          <div className="step-card">
            <h3>2. Search</h3>
            <p>Find compatible blood donors nearby.</p>
          </div>

          <div className="step-card">
            <h3>3. Connect</h3>
            <p>Reach out instantly during emergencies.</p>
          </div>

          <div className="step-card">
            <h3>4. Save Lives</h3>
            <p>Receive or donate blood when needed.</p>
          </div>

        </div>
      </section>

      {/* TRUST */}
      <section className="trust-section">
        <div className="trust-card">
          <ShieldCheck size={50} />
          <h2>Verified Blood Donation Network</h2>
          <p>
            Our platform connects registered users and donors
            securely to ensure faster and safer blood donations.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Become a Donor Today</h2>

        <p>
          Join our growing community and help save lives when every second matters.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/register-donor")}
        >
          Register As Donor
        </button>
      </section>

    </div>
  );
}

export default Dashboard;