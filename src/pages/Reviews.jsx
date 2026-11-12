import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate } from "../services/format";
import ReviewForm, { Stars } from "../components/ReviewForm";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/mybookings.css";

// Completed rentals waiting for a review, plus the reviews already written.
// /reviews/:code opens the form for that booking straight away.
const Reviews = () => {
  const { code } = useParams();
  const [toReview, setToReview] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [open, setOpen] = useState(code || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([API.get("/bookings/my"), API.get("/me/reviews")])
      .then(([b, r]) => {
        setToReview(b.data.filter(x => x.status === "COMPLETED" && !x.reviewed));
        setReviews(r.data);
      })
      .catch(err => setError(errorMessage(err, "Could not load your reviews")))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <SiteHeader />
      <div className="container page mybookings-container">
        <h1 className="page-title">Reviews</h1>
        <p className="page-subtitle">Your ratings help other customers and tell us which vehicles and drivers are doing well.</p>
        {error && <div className="form-error">{error}</div>}
        {loading && <p className="muted">Loading...</p>}

        {!loading && (
          <>
            <section>
              <div className="section-title">
                <h2>Waiting for your review</h2>
                <span className="count">{toReview.length}</span>
              </div>
              {toReview.length === 0 ? (
                <p className="empty-state">Nothing to review right now.</p>
              ) : (
                <div className="bookings-grid">
                  {toReview.map(b => (
                    <div key={b.id} className="booking-card">
                      <div className="booking-header">
                        <h3>{b.vehicleName}</h3>
                        <span className="muted">{formatDate(b.returnDate)}</span>
                      </div>
                      <p className="muted small-text">{b.pickupLocation} · {b.days} day{b.days === 1 ? "" : "s"} · {b.bookingCode}</p>
                      {open === b.bookingCode ? (
                        <ReviewForm booking={b} onDone={() => { setOpen(null); load(); }} />
                      ) : (
                        <button className="btn-primary" onClick={() => setOpen(b.bookingCode)}>Rate this trip</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="section-title">
                <h2>Your reviews</h2>
                <span className="count">{reviews.length}</span>
              </div>
              {reviews.length === 0 ? (
                <p className="empty-state">You haven't written any reviews yet.</p>
              ) : (
                <div className="notifications-list">
                  {reviews.map(r => (
                    <div key={r.id} className="notification-item">
                      <div className="notif-content">
                        <h4>
                          <Link to={`/vehicle/${r.vehicleId}`}>{r.vehicleName}</Link> · <Stars value={r.vehicleRating} />
                        </h4>
                        {r.driverName && <p className="muted">Driver {r.driverName}: {r.driverRating}/5</p>}
                        {r.comment && <p>{r.comment}</p>}
                        <span className="notif-time">{formatDate(r.createdAt)} · <Link to={`/history/${r.bookingCode}`}>{r.bookingCode}</Link></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default Reviews;
