import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after logging in (e.g. back to the vehicle the user wanted to book)
  const from = location.state?.from || "/history";
  const fromState = location.state?.fromState;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true, state: fromState });
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  };

  return (
    <div>
    <SiteHeader />
    <div className="auth-container">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="auth-subtext">
          {location.state?.from ? "Log in to continue with your booking." : "Use the email and password you signed up with."}
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          New to SmartRide?{" "}
          <Link to="/register" state={location.state}>Create an account</Link>
        </p>
        <div className="demo-hint">
          Demo account: <strong>demo@smartride.com</strong> / <strong>demo1234</strong>
        </div>
        <div className="other-logins">
          <span>Not a customer?</span>
          <Link to="/driver/login">Driver login</Link>
          <Link to="/admin/login">Admin login</Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
