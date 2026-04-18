import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminBookings = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };
  const [bookings, setBookings] = useState([
    { id: "BK-001", vehicle: "Honda City", user: "Raj Kumar", date: "2026-04-15", amount: 2500, status: "COMPLETED", action: "—" },
    { id: "BK-002", vehicle: "Mahindra Thar", user: "Priya Singh", date: "2026-04-17", amount: 7350, status: "ACTIVE", action: "Approve/Reject" },
    { id: "BK-003", vehicle: "BMW X5", user: "Arjun Patel", date: "2026-04-20", amount: 15000, status: "PENDING", action: "Approve" },
    { id: "BK-004", vehicle: "Maruti Swift", user: "Neha Verma", date: "2026-04-18", amount: 2800, status: "COMPLETED", action: "—" }
  ]);

  const handleApprove = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: "APPROVED", action: "—" } : b));
    alert("Booking approved!");
  };

  const handleReject = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: "REJECTED", action: "—" } : b));
    alert("Booking rejected!");
  };

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

      {/* Bookings Table */}
      <section className="admin-section">
        <h2>All Bookings</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Vehicle</th>
              <th>User</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.vehicle}</td>
                <td>{booking.user}</td>
                <td>{booking.date}</td>
                <td>₹{booking.amount}</td>
                <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                <td>
                  {booking.status === "PENDING" && (
                    <>
                      <button className="btn-small approve" onClick={() => handleApprove(booking.id)}>✓ Approve</button>
                      <button className="btn-small reject" onClick={() => handleReject(booking.id)}>✕ Reject</button>
                    </>
                  )}
                  {booking.status === "ACTIVE" && (
                    <>
                      <button className="btn-small approve" onClick={() => handleApprove(booking.id)}>✓ Approve</button>
                      <button className="btn-small reject" onClick={() => handleReject(booking.id)}>✕ Reject</button>
                    </>
                  )}
                  {booking.status !== "PENDING" && booking.status !== "ACTIVE" && (
                    <button className="btn-small view">View</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Booking Stats */}
      <section className="admin-section">
        <h2>Booking Summary</h2>
        <div className="stats-flex">
          <div className="stat-small">
            <p className="label">Total Bookings</p>
            <h3>{bookings.length}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Completed</p>
            <h3>{bookings.filter(b => b.status === "COMPLETED").length}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Pending Approval</p>
            <h3>{bookings.filter(b => b.status === "PENDING" || b.status === "ACTIVE").length}</h3>
          </div>
          <div className="stat-small">
            <p className="label">Total Revenue</p>
            <h3>₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminBookings;
