import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  // Mock data
  const stats = {
    totalBookings: 1248,
    totalRevenue: 524000,
    activeDrivers: 45,
    availableVehicles: 28
  };

  const recentBookings = [
    { id: "BK-001", vehicle: "Honda City", user: "Raj Kumar", amount: 2500, status: "Completed" },
    { id: "BK-002", vehicle: "Mahindra Thar", user: "Priya Singh", amount: 7350, status: "Active" },
    { id: "BK-003", vehicle: "BMW X5", user: "Arjun Patel", amount: 15000, status: "Pending" }
  ];

  const topVehicles = [
    { name: "Honda City", bookings: 156, revenue: 312000 },
    { name: "Mahindra Thar", bookings: 128, revenue: 256000 },
    { name: "Maruti Swift", bookings: 112, revenue: 224000 },
    { name: "BMW X5", bookings: 45, revenue: 450000 }
  ];

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>📊 Overview</button>
          <button className={activeTab === "vehicles" ? "active" : ""} onClick={() => navigate("/admin/vehicles")}>🚗 Vehicles</button>
          <button className={activeTab === "drivers" ? "active" : ""} onClick={() => navigate("/admin/drivers")}>👥 Drivers</button>
          <button className={activeTab === "bookings" ? "active" : ""} onClick={() => navigate("/admin/bookings")}>📅 Bookings</button>
          <button className={activeTab === "analytics" ? "active" : ""} onClick={() => navigate("/admin/analytics")}>📈 Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Total Bookings</p>
            <h2 className="stat-value">{stats.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Active Drivers</p>
            <h2 className="stat-value">{stats.activeDrivers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <p className="stat-label">Available Vehicles</p>
            <h2 className="stat-value">{stats.availableVehicles}</h2>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <button className="btn-view-all" onClick={() => navigate("/admin/bookings")}>View All →</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Vehicle</th>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.vehicle}</td>
                <td>{booking.user}</td>
                <td>₹{booking.amount}</td>
                <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                <td>
                  <button className="btn-small">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Top Vehicles */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Top Performing Vehicles</h2>
        </div>
        <div className="vehicles-list">
          {topVehicles.map((vehicle, idx) => (
            <div key={idx} className="vehicle-item">
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p>Bookings: {vehicle.bookings} | Revenue: ₹{vehicle.revenue.toLocaleString()}</p>
              </div>
              <div className="vehicle-bar">
                <div className="bar-fill" style={{width: `${(vehicle.bookings / 156) * 100}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Info */}
      <section className="admin-info">
        <div className="info-box">
          <h3>📌 Admin Setup</h3>
          <p>Admins are manually created and limited. To add new admins:</p>
          <ol>
            <li>Contact the system administrator</li>
            <li>Provide user email and role</li>
            <li>Admin credentials will be created in the database</li>
            <li>Admin can then login with email/password</li>
          </ol>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
