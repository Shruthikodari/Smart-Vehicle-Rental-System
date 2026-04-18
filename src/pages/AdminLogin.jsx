import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-login.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo admin credentials (in production, validate against backend)
  const DEMO_ADMIN = {
    email: "admin@smartride.com",
    password: "admin1234"
  };

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        // Store admin session
        localStorage.setItem("adminToken", "admin_token_" + Date.now());
        localStorage.setItem("adminUser", JSON.stringify({ email, role: "ADMIN" }));
        navigate("/admin", { replace: true });
      } else {
        setError("❌ Invalid admin credentials. Please check your email and password.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Login failed. Please try again.");
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
            <li>✓ Secure session management</li>
            <li>✓ Encrypted credentials</li>
            <li>✓ Role-based access control</li>
            <li>✓ Activity logging</li>
            <li>✓ Auto-logout on inactivity</li>
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
