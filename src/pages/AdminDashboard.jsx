import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import AdminLayout from "../components/AdminLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([API.get("/admin/dashboard"), API.get("/admin/bookings")])
      .then(([dashboardRes, bookingsRes]) => {
        setStats(dashboardRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      })
      .catch(err => setError(errorMessage(err, "Could not load dashboard")));
  }, []);

  if (error) return <AdminLayout title="Overview"><div className="form-error">{error}</div></AdminLayout>;
  if (!stats) return <AdminLayout title="Overview"><p>Loading dashboard...</p></AdminLayout>;

  const topVehicles = stats.topVehicles;
  const maxRevenue = Math.max(1, ...topVehicles.map(v => v.revenue));

  return (
    <AdminLayout title="Overview" subtitle="Today's numbers and the latest booking requests.">

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total bookings</p>
            <h2 className="stat-value">{stats.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Revenue collected</p>
            <h2 className="stat-value">₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Active drivers</p>
            <h2 className="stat-value">{stats.activeDrivers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Vehicles free today</p>
            <h2 className="stat-value">{stats.availableVehicles} / {stats.totalVehicles}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Waiting for approval</p>
            <h2 className="stat-value">{stats.pendingBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Customers</p>
            <h2 className="stat-value">{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Out on rent now</p>
            <h2 className="stat-value">{stats.onRentToday}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Reviews</p>
            <h2 className="stat-value">{stats.totalReviews}</h2>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Recent bookings {stats.pendingBookings > 0 && <span style={{color: 'var(--amber)', fontSize: 14, fontWeight: 500}}>· {stats.pendingBookings} awaiting your review</span>}</h2>
          <button className="btn-view-all" onClick={() => navigate("/admin/bookings")}>View all</button>
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
          <h2>Top vehicles by revenue</h2>
        </div>
        <div className="vehicles-list">
          {topVehicles.map((vehicle) => (
            <div key={vehicle.name} className="vehicle-item">
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <p>Bookings: {vehicle.bookings} | Revenue: ₹{vehicle.revenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="vehicle-bar">
                <div className="bar-fill" style={{width: `${(vehicle.revenue / maxRevenue) * 100}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </AdminLayout>
  );
};

export default AdminDashboard;
