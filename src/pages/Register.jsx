import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SiteHeader from "../components/SiteHeader";
import "../styles/auth.css";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where to go after signing up (e.g. back to the vehicle the user wanted to book)
  const from = location.state?.from || "/history";
  const fromState = location.state?.fromState;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a 10-digit phone number");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await register({ fullName, email, phone, password });

      if (result.success) {
        // Registration also logs the user in, so continue where they left off
        navigate(from, { replace: true, state: fromState });
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <SiteHeader />
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtext">You need an account to book. It takes less than a minute.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

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
            <label>Mobile number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              maxLength="10"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;
