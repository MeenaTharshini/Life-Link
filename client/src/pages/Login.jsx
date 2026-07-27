import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // AuthContext login handles Supabase authentication
      await login(form.email.trim(), form.password);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setMessage(
        err?.message ||
        "Invalid email or password."
      );
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

        <h2>Welcome Back</h2>

        <p className="auth-subtitle">
          Login to Life-Link Blood Finder
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div className="auth-links">
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;