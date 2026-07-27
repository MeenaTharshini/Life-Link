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

import "./Landing.css";
const API = import.meta.env.VITE_API_URL;
function Landing() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
  users: 0,
  donors: 0,
  requests: 0,
});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
  `${API}/api/dashboard/stats`
);

        setStats({
  users: res.data.users || 0,
  donors: res.data.donors || 0,
  requests: res.data.requests || 0,
});
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <HeartPulse size={40} />,
      title: "Smart Matching",
      desc: "Find compatible blood donors instantly.",
    },
    {
      icon: <MapPinned size={40} />,
      title: "Location Based Search",
      desc: "Locate nearby donors quickly.",
    },
    {
      icon: <Users size={40} />,
      title: "Verified Community",
      desc: "Trusted network of donors and requesters.",
    },
  ];

  return (
    <div className="landing-page">

      {/* HERO */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge">
            Life-Link Blood Finder System
          </span>

          <h1 className="hero-title">
            Connecting Donors With Lives That Need Saving
          </h1>

          <p className="hero-subtitle">
            A smart blood donation platform that helps patients,
            hospitals and donors connect during emergencies.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </section>

      {/* REAL STATS */}
      {!loadingStats && stats && (
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
      )}

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

      {/* PROCESS */}
      <section className="process-section">
        <h2>How It Works</h2>

        <div className="process-grid">

          <div className="step-card">
            <h3>1. Register</h3>
            <p>Create your account.</p>
          </div>

          <div className="step-card">
            <h3>2. Search</h3>
            <p>Find compatible donors nearby.</p>
          </div>

          <div className="step-card">
            <h3>3. Connect</h3>
            <p>Reach donors instantly.</p>
          </div>

          <div className="step-card">
            <h3>4. Save Lives</h3>
            <p>Help patients receive blood in emergencies.</p>
          </div>

        </div>
      </section>

      {/* TRUST */}
      <section className="trust-section">
        <div className="trust-card">
          <ShieldCheck size={50} />
          <h2>Safe & Verified Platform</h2>
          <p>
            Every registered donor and requester is verified
            to maintain a trusted blood donation network.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Join The Life-Link Community</h2>

        <p>
          Register today and become part of a network
          dedicated to saving lives.
        </p>

        <button
          className="primary-btn"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>
      </section>

    </div>
  );
}

export default Landing;