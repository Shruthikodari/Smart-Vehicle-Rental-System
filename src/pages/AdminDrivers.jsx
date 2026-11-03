import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin.css";

const EMPTY_FORM = { name: "", phone: "", email: "", licenseNumber: "" };

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  useEffect(() => {
    API.get("/admin/drivers")
      .then(res => setDrivers(res.data))
      .catch(err => setError(errorMessage(err, "Could not load drivers")));
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      const res = await API.put(`/admin/drivers/${id}/toggle`);
      setDrivers(drivers.map(d => d.id === id ? res.data : d));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleAddDriver = async () => {
    if (!formData.name.trim() || !/^\d{10}$/.test(formData.phone)) {
      setFormError("Name and a 10-digit phone number are required");
      return;
    }
    try {
      const res = await API.post("/admin/drivers", formData);
      setDrivers([...drivers, res.data]);
      setFormData(EMPTY_FORM);
      setFormError("");
      setShowForm(false);
    } catch (err) {
      setFormError(errorMessage(err, "Could not add driver"));
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Driver Management</h1>
        <div className="admin-nav">
          <button onClick={() => navigate("/admin")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/vehicles")}>🚗 Vehicles</button>
          <button className="active">👥 Drivers</button>
          <button onClick={() => navigate("/admin/bookings")}>📅 Bookings</button>
          <button onClick={() => navigate("/admin/analytics")}>📈 Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {error && <p style={{color: '#ff6b6b'}}>{error}</p>}

      <button className="btn-add" onClick={() => setShowForm(!showForm)}>+ Add New Driver</button>

      {showForm && (
        <div className="admin-form">
          <h3>Add New Driver</h3>
          {formError && <p style={{color: '#ff6b6b'}}>{formError}</p>}
          <div className="form-grid">
            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input type="tel" placeholder="Phone (10 digits)" maxLength="10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})} />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="text" placeholder="Driving License No." value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
            <button className="btn-submit" onClick={handleAddDriver}>Add Driver</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <section className="admin-section">
        <h2>All Drivers</h2>
        <p style={{color: '#888', marginTop: 0}}>Active drivers are auto-assigned to "With driver" bookings (highest rated first). Blocked drivers are never assigned.</p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>License</th>
              <th>Rating</th>
              <th>Trips</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.email}</td>
                <td>{driver.licenseNumber}</td>
                <td>
                  <div className="rating">
                    <span className="stars">⭐</span>
                    <span>{driver.rating}</span>
                  </div>
                </td>
                <td>{driver.trips}</td>
                <td>
                  <span className={`status-badge ${driver.status.toLowerCase()}`}>
                    {driver.status}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn-small ${driver.status === "ACTIVE" ? "block" : "unblock"}`}
                    onClick={() => handleToggleBlock(driver.id)}
                  >
                    {driver.status === "ACTIVE" ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Driver Stats */}
      <section className="admin-section">
        <h2>Driver Performance</h2>
        <div className="stats-flex">
          {drivers.map(driver => (
            <div key={driver.id} className="driver-card">
              <h4>{driver.name}</h4>
              <p className="rating-text">⭐ {driver.rating} rating</p>
              <p className="trips-text">{driver.trips} trips completed</p>
              <p className={`status-text ${driver.status.toLowerCase()}`}>{driver.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDrivers;
