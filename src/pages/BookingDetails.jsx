import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate, formatDateTime, rupees, titleCase, driverLabel, daysUntil, downloadReceipt } from "../services/format";
import StatusTimeline from "../components/StatusTimeline";
import { Stars } from "../components/ReviewForm";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/mybookings.css";

const STATUS_TEXT = {
  PENDING: "Waiting for SmartRide to approve your request.",
  APPROVED: "Approved. See you at pickup!",
  ONGOING: "Your rental is in progress.",
  COMPLETED: "Trip completed. Thanks for riding with us.",
  REJECTED: "This request was not approved.",
  CANCELLED: "This booking was cancelled.",
};

// Everything about one booking, with cancel, receipt and review actions
const BookingDetails = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/bookings/${code}`)
      .then(res => setBooking(res.data))
      .catch(err => setError(errorMessage(err, "Could not load this booking")));
    API.get("/me/reviews")
      .then(res => setReview(res.data.find(r => r.bookingCode === code) || null))
      .catch(() => {});
  }, [code]);

  const cancel = async () => {
    if (!confirm(`Cancel booking ${booking.bookingCode} for ${booking.vehicleName}?`)) return;
    try {
      const res = await API.put(`/bookings/${booking.bookingCode}/cancel`);
      setBooking(res.data);
    } catch (err) {
      alert(errorMessage(err, "Could not cancel booking"));
    }
  };

  const shell = (content) => (
    <div>
      <SiteHeader />
      <div className="container page">{content}</div>
      <SiteFooter />
    </div>
  );

  if (error) return shell(<div className="form-error">{error}</div>);
  if (!booking) return shell(<p className="muted">Loading booking...</p>);

  const canCancel = (booking.status === "PENDING" || booking.status === "APPROVED") && daysUntil(booking.pickupDate) > 0;

  return shell(
    <>
      <button className="back-link" onClick={() => navigate("/history")}>← Back to My bookings</button>
      <div className="details-head">
        <div>
          <h1 className="page-title">{booking.vehicleName}</h1>
          <p className="page-subtitle">Booking {booking.bookingCode} · requested {formatDateTime(booking.createdAt)}</p>
        </div>
        <span className={`status-badge ${booking.status.toLowerCase()}`}>{titleCase(booking.status)}</span>
      </div>

      <div className="details-grid">
        <div className="panel details-panel">
          <StatusTimeline status={booking.status} />
          <p className="status-text-line">{STATUS_TEXT[booking.status]}</p>
          {booking.adminNote && <p className="note note-error">Note from SmartRide: {booking.adminNote}</p>}

          <h3>Trip</h3>
          <div className="booking-details">
            <div className="detail-item"><span className="label">Pick-up</span><span className="value">{formatDate(booking.pickupDate)}</span></div>
            <div className="detail-item"><span className="label">Return</span><span className="value">{formatDate(booking.returnDate)}</span></div>
            <div className="detail-item"><span className="label">Duration</span><span className="value">{booking.days} day{booking.days === 1 ? "" : "s"}</span></div>
            <div className="detail-item"><span className="label">Pick-up location</span><span className="value">{booking.pickupLocation}</span></div>
            <div className="detail-item"><span className="label">Driver</span><span className="value">{driverLabel(booking)}</span></div>
          </div>

          <h3>Your review</h3>
          {review ? (
            <div className="review-box">
              <Stars value={review.vehicleRating} />
              {review.driverRating && <span className="muted"> · Driver {review.driverRating}/5</span>}
              {review.comment && <p>{review.comment}</p>}
            </div>
          ) : booking.status === "COMPLETED" ? (
            <button className="btn-primary" onClick={() => navigate(`/reviews/${booking.bookingCode}`)}>Write a review</button>
          ) : (
            <p className="muted">You can review this rental once it's completed.</p>
          )}
        </div>

        <aside className="panel details-panel">
          <h3>Payment</h3>
          <div className="booking-details">
            <div className="detail-item"><span className="label">Rent</span><span className="value">{rupees(booking.basePrice)}</span></div>
            {booking.driverCost > 0 && <div className="detail-item"><span className="label">Driver</span><span className="value">{rupees(booking.driverCost)}</span></div>}
            <div className="detail-item"><span className="label">Tax (5%)</span><span className="value">{rupees(booking.taxes)}</span></div>
            <div className="detail-item highlight"><span className="label">Total</span><span className="value">{rupees(booking.total)}</span></div>
            <div className="detail-item"><span className="label">Method</span><span className="value">{booking.paymentMethod}</span></div>
            <div className="detail-item"><span className="label">Status</span><span className="value">{titleCase(booking.paymentStatus)}</span></div>
            {booking.transactionId && <div className="detail-item"><span className="label">Transaction</span><span className="value">{booking.transactionId}</span></div>}
          </div>
          <div className="booking-actions">
            <button className="btn-secondary" onClick={() => downloadReceipt(booking)}>Download receipt</button>
            {canCancel && <button className="btn-secondary danger" onClick={cancel}>Cancel booking</button>}
          </div>
        </aside>
      </div>
    </>
  );
};

export default BookingDetails;
