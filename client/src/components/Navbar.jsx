import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  Search,
  Menu,
  X,
  LogOut,
  Heart,
  Droplet,
  LogIn,
  UserPlus,
  LayoutDashboard,
  UserCircle,
  Bell,
  Users,
  ClipboardPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const {
  authUser,
  logout,
  canDonate,
  notificationCount,
  acceptedCount,
} = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    closeMenu();
  };
  const mobileLinks = [
  {
    to: "/dashboard",
    icon: <LayoutDashboard size={22} />,
    text: "Home",
  },
  {
    to: "/search",
    icon: <Search size={22} />,
    text: "Search",
  },
  {
    to: "/create-request",
    icon: <ClipboardPlus size={26} />,
    text: "Request",
  },
  {
    to: "/notifications",
    icon: (
      <div className="nav-icon">
        <Bell size={22} />

        {canDonate && notificationCount > 0 && (
          <span className="nav-badge">
            {notificationCount}
          </span>
        )}
      </div>
    ),
    text: "Alerts",
  },
  {
    to: "/profile",
    icon: <UserCircle size={22} />,
    text: "Profile",
  },
];
  const loggedInLinks = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={18} />,
      text: "Dashboard",
    },
    {
      to: "/search",
      icon: <Search size={18} />,
      text: "Find Donors",
    },
    {
      to: "/create-request",
      icon: <ClipboardPlus size={18} />,
      text: "Blood Requests",
    },
    {
      to: "/register-donor",
      icon: <Heart size={18} />,
      text: "Become Donor",
    },
    {
    to: "/notifications",
    icon: (
      <div className="nav-icon">
        <Bell size={18} />

        {canDonate && notificationCount > 0 && (
          <span className="nav-badge">
            {notificationCount}
          </span>
        )}
      </div>
    ),
    text: "Notifications",
  },
    {
      to: "/profile",
      icon: <UserCircle size={18} />,
      text: "Profile",
    },
  ];

  const guestLinks = [
    {
      to: "/",
      icon: <Home size={18} />,
      text: "Home",
    },
    {
      to: "/login",
      icon: <LogIn size={18} />,
      text: "Login",
    },
    {
      to: "/signup",
      icon: <UserPlus size={18} />,
      text: "Sign Up",
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">

        <Link
  to={authUser ? "/dashboard" : "/"}
  className="logo"
>
  <span className="live-dot"></span>
  <span>Life-Link</span>
</Link>

        <nav className="nav-menu">
          {(authUser ? loggedInLinks : guestLinks).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
            >
              {item.icon}
              {item.text}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">

          {authUser && (
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

        </div>

      </div>

            {menuOpen && (
        <div className="mobile-menu">

          {(authUser ? loggedInLinks : guestLinks).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
            >
              {item.text}
            </NavLink>
          ))}

          {authUser && (
            <button
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}

        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {authUser && (
  <nav className="bottom-navbar">
    {mobileLinks.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className="bottom-link"
      >
        {item.icon}
        <span>{item.text}</span>
      </NavLink>
    ))}
  </nav>
)}

    </header>
  );
}

export default Navbar;