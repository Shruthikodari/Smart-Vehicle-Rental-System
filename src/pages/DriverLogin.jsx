import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin-login.css";

const DriverLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login/driver", { email: email.trim(), password });
      localStorage.setItem("driverToken", res.data.token);
      localStorage.setItem("driverUser", JSON.stringify(res.data.data));
      navigate("/driver/dashboard", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="site-logo"><span className="logo-mark">S</span>SmartRide</div>
          <h1>Driver login</h1>
          <p>See your assigned trips and earnings.</p>
        </div>

        {location.state?.registered && (
          <p className="note note-ok">Registration received. You can log in once an admin approves your account.</p>
        )}

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-box">{error}</div>}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-switch">New driver? <Link to="/driver/register">Register here</Link></p>
        <div className="demo-hint">
          Demo driver: <strong>raj@smartride.com</strong> / <strong>driver123</strong>
        </div>
      </div>

      <div className="admin-login-footer">
        <button onClick={() => navigate("/")}>← Back to the customer site</button>
      </div>
    </div>
  );
};

export default DriverLogin;
