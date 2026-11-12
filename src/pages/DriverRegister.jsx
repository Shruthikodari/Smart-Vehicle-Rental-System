import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin-login.css";

const EMPTY = { name: "", email: "", phone: "", licenseNumber: "", password: "" };

// Drivers apply here; an admin approves them before they can log in or get trips
const DriverRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (name) => (e) =>
    setForm({ ...form, [name]: name === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Please enter a 10-digit mobile number");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/register/driver", form);
      navigate("/driver/login", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(errorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="site-logo"><span className="logo-mark">S</span>SmartRide</div>
          <h1>Drive with SmartRide</h1>
          <p>Register as a driver. Our team checks your licence and approves your account, usually within a day.</p>
        </div>

        <form onSubmit={submit} className="login-form">
          {error && <div className="error-box">{error}</div>}
          <div className="form-group"><label>Full name</label><input value={form.name} onChange={set("name")} required /></div>
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={set("email")} required /></div>
          <div className="form-group"><label>Mobile number</label><input value={form.phone} maxLength="10" onChange={set("phone")} required /></div>
          <div className="form-group"><label>Driving licence number</label><input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="e.g. TS0920190001234" required /></div>
          <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={set("password")} required /></div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Sending..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">Already registered? <Link to="/driver/login">Log in</Link></p>
      </div>
    </div>
  );
};

export default DriverRegister;
