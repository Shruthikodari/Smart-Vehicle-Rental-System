import { useNavigate, useLocation } from "react-router-dom";
import StatusTimeline from "../components/StatusTimeline";
import "../styles/confirmation.css";

const methodLabel = {
  UPI: "UPI",
  CARD: "Credit/Debit Card",
  CASH: "Cash on pickup",
};

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Booking as saved by the backend
  const { booking } = location.state || {};

  if (!booking) {
    return (
      <div className="confirmation-container">
        <p style={{color: '#ff6b6b'}}>No booking details found.</p>
      </div>
    );
  }

  const isCash = booking.paymentMethod === "CASH";

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        {/* Success Icon */}
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1>Booking Request Submitted!</h1>
        <p className="confirmation-message">
          Your request is waiting for admin review. You'll get a notification on your dashboard once it is approved.
        </p>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <StatusTimeline status={booking.status} />
        </div>

        {/* Booking Details */}
        <div className="details-section">
          <div className="detail-row">
            <span className="label">Booking ID</span>
            <span className="value">{booking.bookingCode}</span>
          </div>

          <div className="detail-row">
            <span className="label">Vehicle</span>
            <span className="value">{booking.vehicleName}</span>
          </div>

          <div className="detail-row">
            <span className="label">Pickup</span>
            <span className="value">{booking.pickupLocation}</span>
          </div>

          <div className="detail-row">
            <span className="label">From</span>
            <span className="value">{booking.pickupDate}</span>
          </div>

          <div className="detail-row">
            <span className="label">To</span>
            <span className="value">{booking.returnDate}</span>
          </div>

          <div className="detail-row">
            <span className="label">Driver</span>
            <span className="value">
              {booking.driverType === "SELF_DRIVE"
                ? "Self Drive"
                : `${booking.driverName} (${booking.driverPhone})`}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">Method</span>
            <span className="value">{methodLabel[booking.paymentMethod] || booking.paymentMethod}</span>
          </div>

          {booking.transactionId && (
            <div className="detail-row">
              <span className="label">Transaction ID</span>
              <span className="value">{booking.transactionId}</span>
            </div>
          )}

          <div className="detail-row highlight">
            <span className="label">{isCash ? "Pay at pickup" : "Total paid"}</span>
            <span className="value">₹{booking.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn-bookings"
            onClick={() => navigate("/dashboard")}
          >
            Go to My Dashboard
          </button>
          <button
            className="btn-another"
            onClick={() => navigate("/home")}
          >
            Book Another Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
