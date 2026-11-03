import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  useEffect(() => {
    Promise.all([API.get("/admin/dashboard"), API.get("/admin/bookings")])
      .then(([dashboardRes, bookingsRes]) => {
        setStats(dashboardRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      })
      .catch(err => setError(errorMessage(err, "Could not load dashboard")));
  }, []);

  if (error) return <div className="admin-container"><p style={{color: '#ff6b6b'}}>{error}</p></div>;
  if (!stats) return <div className="admin-container"><p>Loading dashboard...</p></div>;

  const topVehicles = stats.topVehicles;
  const maxBookings = Math.max(1, ...topVehicles.map(v => v.bookings));

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <button className="active">📊 Overview</button>
          <button onClick={() => navigate("/admin/vehicles")}>🚗 Vehicles</button>
          <button onClick={() => navigate("/admin/drivers")}>👥 Drivers</button>
          <button onClick={() => navigate("/admin/bookings")}>📅 Bookings</button>
          <button onClick={() => navigate("/admin/analytics")}>📈 Analytics</button>
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
            <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
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
            <p className="stat-label">Available Today</p>
            <h2 className="stat-value">{stats.availableVehicles} / {stats.totalVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending Approval</p>
            <h2 className="stat-value">{stats.pendingBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🙋</div>
          <div className="stat-content">
            <p className="stat-label">Customers</p>
            <h2 className="stat-value">{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛣️</div>
          <div className="stat-content">
            <p className="stat-label">On Rent Now</p>
            <h2 className="stat-value">{stats.onRentToday}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Reviews</p>
            <h2 className="stat-value">{stats.totalReviews}</h2>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Recent Bookings {stats.pendingBookings > 0 && <span style={{color: '#ff9800', fontSize: 14}}>· {stats.pendingBookings} awaiting your review</span>}</h2>
          <button className="btn-view-all" onClick={() => navigate("/admin/bookings")}>View All →</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Vehicle</th>
              <th>Customer</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.bookingCode}</td>
                <td>{booking.vehicleName}</td>
                <td>{booking.customerName}</td>
                <td>{booking.pickupDate} → {booking.returnDate}</td>
                <td>₹{booking.total.toLocaleString("en-IN")}</td>
                <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
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
          {topVehicles.map((vehicle) => (
            <div key={vehicle.name} className="vehicle-item">
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p>Bookings: {vehicle.bookings} | Revenue: ₹{vehicle.revenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="vehicle-bar">
                <div className="bar-fill" style={{width: `${(vehicle.bookings / maxBookings) * 100}%`}}></div>
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
