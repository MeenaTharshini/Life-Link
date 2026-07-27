import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      path: "/",
      icon: "⌂",
      label: "Overview"
    },
    {
      path: "/dashboard",
      icon: "◈",
      label: "Dashboard"
    },
    {
      path: "/search",
      icon: "⌕",
      label: "Find Donors"
    },
    {
      path: "/register-donor",
      icon: "❤",
      label: "Become Donor"
    },
    {
      path: "/register-user",
      icon: "◉",
      label: "Users"
    },
    {
      path: "/create-request",
      icon: "✦",
      label: "Blood Requests"
    },
    {
      path: "/notifications",
      icon: "◔",
      label: "Notifications"
    }
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-top">

        <div className="sidebar-logo">
          <div className="logo-circle"></div>

          <div>
            <h2>Life-Link</h2>
            <p>Intelligence Layer</p>
          </div>
        </div>

      </div>

      <nav className="sidebar-nav">

        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              location.pathname === item.path
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            {item.label}
          </Link>
        ))}

      </nav>

      <div className="sidebar-footer">

        <h4>AI Matching Engine</h4>

        <p>
          Smart donor discovery using
          compatibility, availability and
          location intelligence.
        </p>

      </div>

    </aside>
  );
}

export default Sidebar;