import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import supabase from "../lib/supabaseClient";
import "./ResetPassword.css";

function ResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {

    const checkSession = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setValidSession(true);
      } else {
        setMessage("Invalid or expired password reset link.");
      }

    };

    checkSession();

  }, []);

  const updatePassword = async (e) => {

    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) throw error;

      await supabase.auth.signOut();

      setMessage("✅ Password updated successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1800);

    } catch (err) {

      setMessage(err.message);

    } finally {

      setLoading(false);

    }
  };

  if (!validSession) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <h2>Password Reset</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">

      <div className="reset-card">

        <div className="auth-logo">
          <HeartPulse size={48} />
        </div>

        <h2>Create New Password</h2>

        <p className="subtitle">
          Choose a strong password for your account.
        </p>

        <form onSubmit={updatePassword}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default ResetPassword;