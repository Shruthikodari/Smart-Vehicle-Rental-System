import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import AdminLayout from "../components/AdminLayout";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/analytics")
      .then(res => setData(res.data))
      .catch(err => setError(errorMessage(err, "Could not load analytics")));
    API.get("/admin/reviews").then(res => setReviews(res.data)).catch(() => {});
  }, []);

  if (error) return <AdminLayout title="Reports"><div className="form-error">{error}</div></AdminLayout>;
  if (!data) return <AdminLayout title="Reports"><p>Loading analytics...</p></AdminLayout>;

  const maxMonthBookings = Math.max(1, ...data.monthly.map(m => m.bookings));
  const maxVehicleRevenue = Math.max(1, ...data.topVehicles.map(v => v.revenue));
  const typeEntries = Object.entries(data.bookingsByType);
  const typeTotal = typeEntries.reduce((sum, [, n]) => sum + n, 0) || 1;

  return (
    <AdminLayout title="Reports" subtitle="Revenue, demand and customer feedback, based on all bookings.">

      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total bookings</p>
            <h2 className="stat-value">{data.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Revenue collected</p>
            <h2 className="stat-value">₹{(data.totalRevenue / 100000).toFixed(2)}L</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Average booking value</p>
            <h2 className="stat-value">₹{Math.round(data.averageBookingValue).toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Completion rate</p>
            <h2 className="stat-value">{data.completionRate}%</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Average rating</p>
            <h2 className="stat-value">{data.averageRating.toFixed(1)} ({data.totalReviews})</h2>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <section className="admin-section">
        <h2>Last 6 months</h2>
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
        <h2>Top vehicles by revenue</h2>
        <div className="top-vehicles">
          {data.topVehicles.map((vehicle, idx) => (
            <div key={vehicle.name} className="vehicle-stat">
              <div className="rank">#{idx + 1}</div>
              <div className="vehicle-details">
                <h4>{vehicle.name}</h4>
                <p>Bookings: {vehicle.bookings} | Rating {vehicle.rating}</p>
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
        <h2>Bookings by vehicle type</h2>
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
        <p style={{color: 'var(--muted)'}}>{data.withDriverPercent}% of customers choose a driver.</p>
      </section>

      {/* Recent reviews */}
      <section className="admin-section">
        <h2>Recent customer reviews</h2>
        {reviews.length === 0 ? <p style={{color: 'var(--muted)'}}>No reviews yet</p> : reviews.slice(0, 8).map(r => (
          <div key={r.id} className="review-list-item">
            <strong>{r.customerName}</strong> on <strong>{r.vehicleName}</strong>{" "}
            <span className="stars-gold">{"★".repeat(r.vehicleRating)}{"☆".repeat(5 - r.vehicleRating)}</span>
            {r.driverName && <span style={{color: 'var(--muted)'}}> · Driver {r.driverName}: {r.driverRating}★</span>}
            {r.comment && <p>"{r.comment}"</p>}
          </div>
        ))}
      </section>

      {/* Key Insights */}
      <section className="admin-section">
        <h2>Highlights</h2>
        <div className="insights-grid">
          {data.insights.map(insight => (
            <div key={insight.title} className="insight-card">
              <h4>{insight.title}</h4>
              <p>{insight.text}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminAnalytics;
