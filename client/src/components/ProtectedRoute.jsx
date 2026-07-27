import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { authUser, loading } = useAuth();

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b1220",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "5px solid #1f2937",
            borderTop: "5px solid #ef4444",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
          }}
        />

        <h2 style={{ margin: 0 }}>Loading...</h2>

        <style>
          {`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // Allow access
  return children;
}

export default ProtectedRoute;