import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

// Top bar shown on every customer-facing page
const SiteHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    API.get("/me/dashboard").then(res => setUnread(res.data.unreadNotifications)).catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const link = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-logo" onClick={() => navigate("/")}>
          <span className="logo-mark">S</span>
          SmartRide
        </div>
        <nav className="site-nav">
          <NavLink to="/home" className={link}>Browse vehicles</NavLink>
          {user ? (
            <>
              <NavLink to="/history" className={link}>My bookings</NavLink>
              <NavLink to="/reviews" className={link}>Reviews</NavLink>
              <NavLink to="/notifications" className={link}>
                Notifications{unread > 0 && <span className="nav-badge">{unread}</span>}
              </NavLink>
              <NavLink to="/profile" className={link}>{user.name?.split(" ")[0] || "Profile"}</NavLink>
              <button className="btn-secondary" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/driver/register" className={link}>Drive with us</NavLink>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <button className="btn-primary" onClick={() => navigate("/register")}>Sign up</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
