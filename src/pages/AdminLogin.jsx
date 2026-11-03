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
      navigate("/admin", { replace: true });
    } catch (err) {
      setError("❌ " + errorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Top Navigation */}
      <div className="admin-login-nav">
        <button className="back-btn" onClick={() => navigate("/")}>← Back to Home</button>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1>Admin Portal Login</h1>
          <p>Secure access for administrators only</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-box">{error}</div>}

          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartride.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login to Admin Panel →"}
          </button>
        </form>

        {/* Security Info */}
        <div className="security-info">
          <h4>🛡️ Security Features</h4>
          <ul>
            <li>✓ Token-based session management</li>
            <li>✓ BCrypt-hashed passwords</li>
            <li>✓ Role-based access control</li>
            <li>✓ Server-side validation</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="admin-login-footer">
        <p>SmartRide Admin Portal © 2026</p>
        <p>For support contact: support@smartride.com</p>
      </div>
    </div>
  );
};

export default AdminLogin;
