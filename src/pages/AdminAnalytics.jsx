import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  const analyticsData = {
    totalBookings: 1248,
    totalRevenue: 524000,
    averageBookingValue: 419.39,
    completionRate: 94.5
  };

  const monthlyData = [
    { month: "Jan", bookings: 120, revenue: 48000 },
    { month: "Feb", bookings: 135, revenue: 54000 },
    { month: "Mar", bookings: 156, revenue: 62400 },
    { month: "Apr", bookings: 178, revenue: 71200 },
    { month: "May", bookings: 165, revenue: 66000 },
    { month: "Jun", bookings: 194, revenue: 77600 }
  ];

  const topVehicles = [
    { name: "Honda City", bookings: 156, revenue: 312000, rating: 4.7 },
    { name: "Mahindra Thar", bookings: 128, revenue: 384000, rating: 4.5 },
    { name: "BMW X5", bookings: 89, revenue: 445000, rating: 4.9 },
    { name: "Maruti Swift", bookings: 112, revenue: 224000, rating: 4.6 }
  ];

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
            <h2 className="stat-value">{analyticsData.totalBookings}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h2 className="stat-value">₹{(analyticsData.totalRevenue / 100000).toFixed(2)}L</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Avg Booking Value</p>
            <h2 className="stat-value">₹{analyticsData.averageBookingValue.toFixed(0)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Completion Rate</p>
            <h2 className="stat-value">{analyticsData.completionRate}%</h2>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <section className="admin-section">
        <h2>Monthly Trends</h2>
        <div className="chart-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, idx) => (
                <tr key={idx}>
                  <td>{data.month}</td>
                  <td>{data.bookings}</td>
                  <td>₹{data.revenue.toLocaleString()}</td>
                  <td>
                    <div className="growth-bar">
                      <div className="growth-fill" style={{width: `${(data.bookings / 194) * 100}%`}}></div>
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
          {topVehicles.map((vehicle, idx) => (
            <div key={idx} className="vehicle-stat">
              <div className="rank">#{idx + 1}</div>
              <div className="vehicle-details">
                <h4>{vehicle.name}</h4>
                <p>Bookings: {vehicle.bookings} | Rating: ⭐ {vehicle.rating}</p>
              </div>
              <div className="revenue-bar">
                <div className="bar-fill" style={{width: `${(vehicle.revenue / 445000) * 100}%`}}></div>
                <span className="revenue-text">₹{(vehicle.revenue / 1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Insights */}
      <section className="admin-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📈 Revenue Growth</h4>
            <p>Month-over-month revenue increased by 9.3% in June</p>
          </div>
          <div className="insight-card">
            <h4>🏆 Top Performer</h4>
            <p>BMW X5 generates highest revenue per booking (₹5,000/day)</p>
          </div>
          <div className="insight-card">
            <h4>🚗 Most Used</h4>
            <p>Honda City has highest booking frequency (156 bookings)</p>
          </div>
          <div className="insight-card">
            <h4>⭐ Customer Satisfaction</h4>
            <p>Average rating across all vehicles: 4.7/5 stars</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
