import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login/admin", { email: email.trim(), password });
      // Store admin session issued by the backend
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.data));
      navigate("/admin/dashboard", { replace: true });
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
          <h1>Staff login</h1>
          <p>For SmartRide operations staff only.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smartride.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="demo-hint">
          Demo admin: <strong>admin@smartride.com</strong> / <strong>admin1234</strong>
        </div>
      </div>

      <div className="admin-login-footer">
        <button onClick={() => navigate("/")}>← Back to the customer site</button>
      </div>
    </div>
  );
};

export default AdminLogin;
