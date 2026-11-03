import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin.css";

const STATUSES = ["ALL", "PENDING", "APPROVED", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED"];
const today = () => new Date().toISOString().slice(0, 10);

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  const loadBookings = () => {
    API.get("/admin/bookings")
      .then(res => setBookings(res.data))
      .catch(err => setError(errorMessage(err, "Could not load bookings")))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, []);

  const updateStatus = async (booking, status, message) => {
    let note = null;
    if (status === "REJECTED" || status === "CANCELLED") {
      // Reason is shown to the customer in their notification
      note = prompt(`${message} booking ${booking.bookingCode}? Enter a reason for the customer (optional):`, "");
      if (note === null) return;
    } else if (!confirm(`${message} booking ${booking.bookingCode}?`)) {
      return;
    }
    try {
      const res = await API.put(`/admin/bookings/${booking.id}/status`, { status, note });
      setBookings(bookings.map(b => b.id === booking.id ? res.data : b));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const visible = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);
  const count = (status) => bookings.filter(b => b.status === status).length;
  const revenue = bookings.filter(b => b.paymentStatus === "PAID").reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Booking Management</h1>
        <div className="admin-nav">
          <button onClick={() => navigate("/admin")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/vehicles")}>🚗 Vehicles</button>
          <button onClick={() => navigate("/admin/drivers")}>👥 Drivers</button>
          <button className="active">📅 Bookings</button>
          <button onClick={() => navigate("/admin/analytics")}>📈 Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {error && <p style={{color: '#ff6b6b'}}>{error}</p>}

      {/* Booking Stats */}
      <section className="admin-section">
        <h2>Booking Summary</h2>
        <div className="stats-flex">
          <div className="stat-small">
            <p className="label">Total Bookings</p>
            <h3>{bookings.length}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Pending Approval</p>
            <h3>{count("PENDING")}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Approved (Upcoming)</p>
            <h3>{count("APPROVED")}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Ongoing Rentals</p>
            <h3>{count("ONGOING")}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Completed</p>
            <h3>{count("COMPLETED")}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Revenue Collected</p>
            <h3>₹{revenue.toLocaleString("en-IN")}</h3>
          </div>
        </div>
      </section>

      {/* Bookings Table */}
      <section className="admin-section">
        <div className="section-header">
          <h2>All Bookings</h2>
          <select className="status-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <p>Loading bookings...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Dates</th>
                <th>Driver</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.bookingCode}</td>
                  <td>{booking.vehicleName}</td>
                  <td>
                    {booking.customerName}
                    <br /><small style={{color: '#888'}}>{booking.customerPhone || booking.customerEmail}</small>
                  </td>
                  <td>{booking.pickupDate} → {booking.returnDate}</td>
                  <td>{booking.driverName || "Self drive"}</td>
                  <td>₹{booking.total.toLocaleString("en-IN")}</td>
                  <td>{booking.paymentMethod} · {booking.paymentStatus}</td>
                  <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                  <td>
                    {booking.status === "PENDING" && (
                      <>
                        <button className="btn-small approve" onClick={() => updateStatus(booking, "APPROVED", "Approve")}>✓ Approve</button>
                        <button className="btn-small reject" onClick={() => updateStatus(booking, "REJECTED", "Reject")}>✕ Reject</button>
                      </>
                    )}
                    {booking.status === "APPROVED" && (
                      <>
                        {booking.pickupDate <= today() && (
                          <button className="btn-small start" onClick={() => updateStatus(booking, "ONGOING", "Start rental for")}>▶ Start Rental</button>
                        )}
                        <button className="btn-small reject" onClick={() => updateStatus(booking, "CANCELLED", "Cancel")}>✕ Cancel</button>
                      </>
                    )}
                    {booking.status === "ONGOING" && (
                      <button className="btn-small approve" onClick={() => updateStatus(booking, "COMPLETED", "Mark as returned and complete")}>✓ Complete</button>
                    )}
                    {["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status) && (booking.adminNote || "—")}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="9" style={{textAlign: 'center', color: '#888'}}>No bookings</td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminBookings;
