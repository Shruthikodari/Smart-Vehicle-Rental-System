import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/admin.css";

/**
 * Sidebar + page frame shared by the admin and driver portals.
 * `portal` describes the links, where tokens are kept and where to send the user on logout.
 */
const PortalLayout = ({ portal, title, subtitle, actions, children }) => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  let userName = portal.defaultName;
  try {
    userName = JSON.parse(localStorage.getItem(portal.userKey))?.name || userName;
  } catch {
    // keep default name
  }

  useEffect(() => {
    if (!portal.unreadUrl) return;
    API.get(portal.unreadUrl)
      .then(res => setUnread(Array.isArray(res.data) ? res.data.filter(n => !n.read).length : res.data.count))
      .catch(() => {});
  }, [portal.unreadUrl]);

  const handleLogout = () => {
    API.post("/auth/logout", null, { headers: { Authorization: `Bearer ${localStorage.getItem(portal.tokenKey)}` } }).catch(() => {});
    localStorage.removeItem(portal.tokenKey);
    localStorage.removeItem(portal.userKey);
    navigate(portal.loginPath, { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="logo-mark">S</span>
          <div>
            <strong>SmartRide</strong>
            <small>{portal.label}</small>
          </div>
        </div>
        <nav className="admin-menu">
          {portal.links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? "active" : ""}>
              {l.label}
              {l.showUnread && unread > 0 && <span className="menu-badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <span>{userName}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-page-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
};

export default PortalLayout;
