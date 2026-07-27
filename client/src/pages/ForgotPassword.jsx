import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import supabase from "../lib/supabaseClient";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        "✅ Password reset link sent successfully. Please check your email."
      );

      setEmail("");
    } catch (err) {
      setMessage(err.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">

        <div className="auth-logo">
          <HeartPulse size={48} />
        </div>

        <h2>Forgot Password</h2>

        <p className="subtitle">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={resetPassword}>

          <input
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        {message && (
          <p className="message">{message}</p>
        )}

        <div className="back-link">
          <Link to="/login">← Back to Login</Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;