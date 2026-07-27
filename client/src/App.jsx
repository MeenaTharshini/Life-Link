import { HashRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";
import SearchDonors from "./pages/SearchDonors";
import RegisterUser from "./pages/RegisterUser";
import RegisterDonor from "./pages/RegisterDonor";
import CreateRequest from "./pages/CreateRequest";
import Notifications from "./pages/Notifications";

import "./App.css";

/* ========================
   LAYOUT WRAPPER
======================== */
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="app-container">{children}</div>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SearchDonors />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/home"
  element={
    <ProtectedRoute>
      <AppLayout>
        <Home />
      </AppLayout>
    </ProtectedRoute>
  }
/>
        <Route
          path="/register-user"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RegisterUser />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-donor"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RegisterDonor />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-request"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateRequest />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Notifications />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Landing />} />

      </Routes>
    </HashRouter>
  );
}

export default App;