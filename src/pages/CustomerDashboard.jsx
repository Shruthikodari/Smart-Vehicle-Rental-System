import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../services/api";
import StatusTimeline from "../components/StatusTimeline";
import "../styles/mybookings.css";

const ACTIVE = ["PENDING", "APPROVED", "ONGOING"];

const DAY = 24 * 60 * 60 * 1000;
const daysUntil = (date) => Math.round((new Date(date) - new Date(new Date().toISOString().slice(0, 10))) / DAY);

const driverLabel = (b) => b.driverType === "SELF_DRIVE" ? "Self drive" : `${b.driverName || "Driver"} (${b.driverPhone || "-"})`;

const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} hours ago`;
  return `${Math.round(mins / (60 * 24))} days ago`;
};

// Notification type → existing notification styles
const notifClass = { INFO: "info", SUCCESS: "offer", WARNING: "alert", REMINDER: "reminder" };
const notifIcon = { INFO: "ℹ️", SUCCESS: "✅", WARNING: "⚠️", REMINDER: "🔔" };

const downloadReceipt = (b) => {
  const lines = [
    "SMARTRIDE - RENTAL RECEIPT",
    "==========================",
    `Booking ID     : ${b.bookingCode}`,
    `Customer       : ${b.customerName} (${b.customerEmail})`,
    `Vehicle        : ${b.vehicleName}`,
    `Pickup         : ${b.pickupLocation}`,
    `Dates          : ${b.pickupDate} to ${b.returnDate} (${b.days} days)`,
    `Driver         : ${driverLabel(b)}`,
    "",
    `Base price     : Rs. ${b.basePrice}`,
    `Driver charges : Rs. ${b.driverCost}`,
    `Taxes (5%)     : Rs. ${b.taxes}`,
    `TOTAL          : Rs. ${b.total}`,
    "",
    `Payment        : ${b.paymentMethod} - ${b.paymentStatus}`,
    `Transaction ID : ${b.transactionId || "-"}`,
    `Status         : ${b.status}`,
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${b.bookingCode}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// Clickable 1-5 star picker
const StarInput = ({ value, onChange }) => (
  <span className="star-input">
    {[1, 2, 3, 4, 5].map(n => (
      <button type="button" key={n} className={n <= value ? "on" : ""} onClick={() => onChange(n)}>★</button>
    ))}
  </span>
);

const ReviewForm = ({ booking, onDone }) => {
  const [vehicleRating, setVehicleRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await API.post("/reviews", {
        bookingCode: booking.bookingCode,
        vehicleRating,
        driverRating: booking.driverName ? driverRating : null,
        comment,
      });
      onDone();
    } catch (err) {
      setError(errorMessage(err, "Could not submit review"));
      setSaving(false);
    }
  };

  return (
    <div className="review-form">
      <div className="review-row">
        <span>Vehicle</span>
        <StarInput value={vehicleRating} onChange={setVehicleRating} />
      </div>
      {booking.driverName && (
        <div className="review-row">
          <span>Driver ({booking.driverName})</span>
          <StarInput value={driverRating} onChange={setDriverRating} />
        </div>
      )}
      <textarea
        placeholder="Tell others about your trip (optional)"
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="form-error">{error}</p>}
      <button className="btn-primary" onClick={submit} disabled={saving}>
        {saving ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([API.get("/me/dashboard"), API.get("/bookings/my"), API.get("/notifications")])
      .then(([s, b, n]) => {
        setStats(s.data);
        setBookings(b.data);
        setNotifications(n.data);
      })
      .catch(err => setError(errorMessage(err, "Could not load your dashboard")))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const markRead = async (n) => {
    if (n.read) return;
    await API.put(`/notifications/${n.id}/read`).catch(() => {});
    setNotifications(notifications.map(x => x.id === n.id ? { ...x, read: true } : x));
    setStats(s => s && { ...s, unreadNotifications: Math.max(0, s.unreadNotifications - 1) });
  };

  const markAllRead = async () => {
    await API.put("/notifications/read-all").catch(() => {});
    setNotifications(notifications.map(x => ({ ...x, read: true })));
    setStats(s => s && { ...s, unreadNotifications: 0 });
  };

  const handleCancel = async (booking) => {
    if (!confirm(`Cancel booking ${booking.bookingCode} for ${booking.vehicleName}?`)) return;
    try {
      await API.put(`/bookings/${booking.bookingCode}/cancel`);
      load();
    } catch (err) {
      alert(errorMessage(err, "Could not cancel booking"));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const current = bookings.filter(b => ACTIVE.includes(b.status));
  const history = bookings.filter(b => !ACTIVE.includes(b.status));

  const renderDetails = (booking) => (
    <div className="booking-details">
      <div className="detail-item">
        <span className="label">Booking ID</span>
        <span className="value">{booking.bookingCode}</span>
      </div>
      <div className="detail-item">
        <span className="label">Pickup Location</span>
        <span className="value">{booking.pickupLocation}</span>
      </div>
      <div className="detail-item">
        <span className="label">Dates</span>
        <span className="value">{booking.pickupDate} → {booking.returnDate}</span>
      </div>
      <div className="detail-item">
        <span className="label">Driver</span>
        <span className="value">{driverLabel(booking)}</span>
      </div>
      <div className="detail-item">
        <span className="label">Payment</span>
        <span className="value">{booking.paymentMethod} · {booking.paymentStatus}</span>
      </div>
      {booking.adminNote && (
        <div className="detail-item">
          <span className="label">Note</span>
          <span className="value">{booking.adminNote}</span>
        </div>
      )}
      <div className="detail-item highlight">
        <span className="label">Total</span>
        <span className="value">₹{booking.total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );

  if (loading) return <div className="mybookings-container"><p style={{color: '#fff', textAlign: 'center'}}>Loading your dashboard...</p></div>;

  return (
    <div className="mybookings-container">
      {/* Header */}
      <div className="mybookings-header">
        <h1>Welcome, {user?.name?.split(" ")[0]} 👋</h1>
        <p>Your rentals, alerts and history in one place</p>
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => navigate("/home")}>+ Book a Vehicle</button>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <section><div className="form-error">{error}</div></section>}

      {/* Stats */}
      {stats && (
        <section className="dashboard-stats">
          <div className="dash-stat"><span>Total Bookings</span><strong>{stats.totalBookings}</strong></div>
          <div className="dash-stat"><span>Awaiting Approval</span><strong>{stats.pending}</strong></div>
          <div className="dash-stat"><span>Upcoming</span><strong>{stats.upcoming}</strong></div>
          <div className="dash-stat"><span>Ongoing</span><strong>{stats.ongoing}</strong></div>
          <div className="dash-stat"><span>Completed Trips</span><strong>{stats.completed}</strong></div>
          <div className="dash-stat"><span>Total Spent</span><strong>₹{stats.totalSpent.toLocaleString("en-IN")}</strong></div>
        </section>
      )}

      {/* Notifications */}
      <section className="notifications-section">
        <div className="section-title">
          <h2>Notifications</h2>
          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            {stats?.unreadNotifications > 0 && <span className="badge">{stats.unreadNotifications} new</span>}
            {stats?.unreadNotifications > 0 && <button className="btn-secondary" onClick={markAllRead}>Mark all read</button>}
          </div>
        </div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="empty-state">No notifications yet</p>
          ) : (
            notifications.slice(0, 8).map(n => (
              <div
                key={n.id}
                className={`notification-item ${notifClass[n.type] || "info"} ${!n.read ? "unread" : ""}`}
                onClick={() => markRead(n)}
                style={{cursor: n.read ? "default" : "pointer"}}
              >
                <div className="notif-icon">{notifIcon[n.type] || "📢"}</div>
                <div className="notif-content">
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Current bookings */}
      <section className="bookings-section">
        <div className="section-title">
          <h2>Current Bookings</h2>
          <span className="count">{current.length}</span>
        </div>

        {current.length === 0 ? (
          <div className="empty-state">
            <p>No active bookings</p>
            <button className="btn-new-booking" onClick={() => navigate("/home")}>Book a Vehicle</button>
          </div>
        ) : (
          <div className="bookings-grid">
            {current.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.vehicleName}</h3>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                </div>

                <StatusTimeline status={booking.status} />
                {renderDetails(booking)}

                <div className="booking-actions">
                  {(booking.status === "PENDING" || booking.status === "APPROVED") && daysUntil(booking.pickupDate) > 0 && (
                    <button className="btn-secondary" onClick={() => handleCancel(booking)}>Cancel Booking</button>
                  )}
                  <button className="btn-primary" onClick={() => downloadReceipt(booking)}>Download Receipt</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rental history */}
      <section className="bookings-section">
        <div className="section-title">
          <h2>Rental History</h2>
          <span className="count">{history.length}</span>
        </div>

        {history.length === 0 ? (
          <p className="empty-state">No past rentals yet</p>
        ) : (
          <div className="bookings-grid">
            {history.map(booking => (
              <div key={booking.id} className="booking-card past">
                <div className="booking-header">
                  <h3>{booking.vehicleName}</h3>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                </div>

                {renderDetails(booking)}

                {booking.reviewed && (
                  <p className="your-review">Your rating: <span>{"★".repeat(booking.reviewRating)}{"☆".repeat(5 - booking.reviewRating)}</span></p>
                )}
                {reviewing === booking.id && (
                  <ReviewForm booking={booking} onDone={() => { setReviewing(null); load(); }} />
                )}

                <div className="booking-actions">
                  <button className="btn-secondary" onClick={() => downloadReceipt(booking)}>Receipt</button>
                  {booking.status === "COMPLETED" && !booking.reviewed && reviewing !== booking.id && (
                    <button className="btn-primary" onClick={() => setReviewing(booking.id)}>⭐ Rate & Review</button>
                  )}
                  {(booking.reviewed || booking.status !== "COMPLETED") && (
                    <button className="btn-primary" onClick={() => navigate(`/booking/${booking.vehicleId}`)}>Book Again</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Back Button */}
      <div className="back-button">
        <button onClick={() => navigate("/home")}>← Back to Home</button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
