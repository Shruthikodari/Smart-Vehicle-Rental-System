import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees, titleCase } from "../services/format";
import StatusTimeline from "../components/StatusTimeline";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/mybookings.css";

const ACTIVE = ["PENDING", "APPROVED", "ONGOING"];

// Rental history: current bookings and past rentals of the logged-in customer
const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/me/dashboard"), API.get("/bookings/my")])
      .then(([s, b]) => {
        setStats(s.data);
        setBookings(b.data);
      })
      .catch(err => setError(errorMessage(err, "Could not load your bookings")))
      .finally(() => setLoading(false));
  }, []);

  const current = bookings.filter(b => ACTIVE.includes(b.status));
  const past = bookings.filter(b => !ACTIVE.includes(b.status));

  const card = (b, showTimeline) => (
    <Link key={b.id} to={`/history/${b.bookingCode}`} className="booking-card card-link">
      <div className="booking-header">
        <h3>{b.vehicleName}</h3>
        <span className={`status-badge ${b.status.toLowerCase()}`}>{titleCase(b.status)}</span>
      </div>
      {showTimeline && <StatusTimeline status={b.status} />}
      <div className="booking-details">
        <div className="detail-item"><span className="label">Dates</span><span className="value">{formatDate(b.pickupDate)} – {formatDate(b.returnDate)}</span></div>
        <div className="detail-item"><span className="label">Pickup</span><span className="value">{b.pickupLocation}</span></div>
        <div className="detail-item"><span className="label">Booking ID</span><span className="value">{b.bookingCode}</span></div>
        <div className="detail-item highlight"><span className="label">Total</span><span className="value">{rupees(b.total)}</span></div>
      </div>
      {b.status === "COMPLETED" && !b.reviewed && <p className="card-hint">Not reviewed yet</p>}
      <span className="card-more">View details →</span>
    </Link>
  );

  return (
    <div>
      <SiteHeader />
      <div className="container page mybookings-container">
        <div className="mybookings-header">
          <div>
            <h1 className="page-title">My bookings</h1>
            <p className="page-subtitle">Hello {user?.name?.split(" ")[0]}, here are your current and past rentals.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/home")}>Book a vehicle</button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {loading && <p className="muted">Loading your bookings...</p>}

        {stats && (
          <section className="dashboard-stats">
            <div className="dash-stat"><span>Total bookings</span><strong>{stats.totalBookings}</strong></div>
            <div className="dash-stat"><span>Awaiting approval</span><strong>{stats.pending}</strong></div>
            <div className="dash-stat"><span>Upcoming</span><strong>{stats.upcoming}</strong></div>
            <div className="dash-stat"><span>Ongoing</span><strong>{stats.ongoing}</strong></div>
            <div className="dash-stat"><span>Completed trips</span><strong>{stats.completed}</strong></div>
            <div className="dash-stat"><span>Total spent</span><strong>{rupees(stats.totalSpent)}</strong></div>
          </section>
        )}

        {!loading && (
          <>
            <section className="bookings-section">
              <div className="section-title">
                <h2>Current bookings</h2>
                <span className="count">{current.length}</span>
              </div>
              {current.length === 0 ? (
                <div className="empty-state">
                  <p>No active bookings</p>
                  <button className="btn-secondary" onClick={() => navigate("/home")}>Browse vehicles</button>
                </div>
              ) : (
                <div className="bookings-grid">{current.map(b => card(b, true))}</div>
              )}
            </section>

            <section className="bookings-section">
              <div className="section-title">
                <h2>Past rentals</h2>
                <span className="count">{past.length}</span>
              </div>
              {past.length === 0 ? (
                <p className="empty-state">No past rentals yet</p>
              ) : (
                <div className="bookings-grid">{past.map(b => card(b, false))}</div>
              )}
            </section>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default History;
