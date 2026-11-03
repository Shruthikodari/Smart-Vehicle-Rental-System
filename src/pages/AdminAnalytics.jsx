import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin.css";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  useEffect(() => {
    API.get("/admin/analytics")
      .then(res => setData(res.data))
      .catch(err => setError(errorMessage(err, "Could not load analytics")));
    API.get("/admin/reviews").then(res => setReviews(res.data)).catch(() => {});
  }, []);

  if (error) return <div className="admin-container"><p style={{color: '#ff6b6b'}}>{error}</p></div>;
  if (!data) return <div className="admin-container"><p>Loading analytics...</p></div>;

  const maxMonthBookings = Math.max(1, ...data.monthly.map(m => m.bookings));
  const maxVehicleRevenue = Math.max(1, ...data.topVehicles.map(v => v.revenue));
  const typeEntries = Object.entries(data.bookingsByType);
  const typeTotal = typeEntries.reduce((sum, [, n]) => sum + n, 0) || 1;

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Analytics & Reports</h1>
        <div className="admin-nav">
          <button onClick={() => navigate("/admin")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/vehicles")}>🚗 Vehicles</button>
          <button onClick={() => navigate("/admin/drivers")}>👥 Drivers</button>
          <button onClick={() => navigate("/admin/bookings")}>📅 Bookings</button>
          <button className="active">📈 Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Total Bookings</p>
            <h2 className="stat-value">{data.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Revenue Collected</p>
            <h2 className="stat-value">₹{(data.totalRevenue / 100000).toFixed(2)}L</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Avg Booking Value</p>
            <h2 className="stat-value">₹{Math.round(data.averageBookingValue).toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Completion Rate</p>
            <h2 className="stat-value">{data.completionRate}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Avg Customer Rating</p>
            <h2 className="stat-value">{data.averageRating.toFixed(1)} ({data.totalReviews})</h2>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <section className="admin-section">
        <h2>Monthly Trends (last 6 months)</h2>
        <div className="chart-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Bookings</th>
                <th>Booking Value</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map((m) => (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td>{m.bookings}</td>
                  <td>₹{m.revenue.toLocaleString("en-IN")}</td>
                  <td>
                    <div className="growth-bar">
                      <div className="growth-fill" style={{width: `${(m.bookings / maxMonthBookings) * 100}%`}}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Vehicles by Revenue */}
      <section className="admin-section">
        <h2>Top Vehicles by Revenue</h2>
        <div className="top-vehicles">
          {data.topVehicles.map((vehicle, idx) => (
            <div key={vehicle.name} className="vehicle-stat">
              <div className="rank">#{idx + 1}</div>
              <div className="vehicle-details">
                <h4>{vehicle.name}</h4>
                <p>Bookings: {vehicle.bookings} | Rating: ⭐ {vehicle.rating}</p>
              </div>
              <div className="revenue-bar">
                <div className="bar-fill" style={{width: `${(vehicle.revenue / maxVehicleRevenue) * 100}%`}}></div>
                <span className="revenue-text">₹{(vehicle.revenue / 1000).toFixed(1)}K</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bookings by vehicle type */}
      <section className="admin-section">
        <h2>Bookings by Vehicle Type</h2>
        <div className="vehicles-list">
          {typeEntries.map(([type, n]) => (
            <div key={type} className="vehicle-item">
              <div className="vehicle-info">
                <h3>{type}</h3>
                <p>{n} bookings ({Math.round(n * 100 / typeTotal)}%)</p>
              </div>
              <div className="vehicle-bar">
                <div className="bar-fill" style={{width: `${(n / typeTotal) * 100}%`}}></div>
              </div>
            </div>
          ))}
        </div>
        <p style={{color: '#888'}}>{data.withDriverPercent}% of customers choose a driver.</p>
      </section>

      {/* Recent reviews */}
      <section className="admin-section">
        <h2>Recent Customer Reviews</h2>
        {reviews.length === 0 ? <p style={{color: '#888'}}>No reviews yet</p> : reviews.slice(0, 8).map(r => (
          <div key={r.id} className="review-list-item">
            <strong>{r.customerName}</strong> on <strong>{r.vehicleName}</strong>{" "}
            <span className="stars-gold">{"★".repeat(r.vehicleRating)}{"☆".repeat(5 - r.vehicleRating)}</span>
            {r.driverName && <span style={{color: '#888'}}> · Driver {r.driverName}: {r.driverRating}★</span>}
            {r.comment && <p>"{r.comment}"</p>}
          </div>
        ))}
      </section>

      {/* Key Insights */}
      <section className="admin-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          {data.insights.map(insight => (
            <div key={insight.title} className="insight-card">
              <h4>{insight.title}</h4>
              <p>{insight.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
