import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminDrivers = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };
  const [drivers, setDrivers] = useState([
    { id: 1, name: "Raj Kumar", phone: "9876543210", email: "raj@example.com", rating: 4.8, trips: 156, status: "ACTIVE" },
    { id: 2, name: "Priya Singh", phone: "9876543211", email: "priya@example.com", rating: 4.6, trips: 128, status: "ACTIVE" },
    { id: 3, name: "Arjun Patel", phone: "9876543212", email: "arjun@example.com", rating: 4.2, trips: 87, status: "BLOCKED" },
    { id: 4, name: "Neha Verma", phone: "9876543213", email: "neha@example.com", rating: 4.9, trips: 201, status: "ACTIVE" }
  ]);

  const handleToggleBlock = (id) => {
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, status: d.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } : d
    ));
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

      {/* Drivers Table */}
      <section className="admin-section">
        <h2>Active Drivers</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
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
