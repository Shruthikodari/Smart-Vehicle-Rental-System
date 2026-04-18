import { useNavigate, useLocation } from "react-router-dom";
import "../styles/confirmation.css";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, paymentMethod } = location.state || {};

  if (!booking) {
    return (
      <div className="confirmation-container">
        <p style={{color: '#ff6b6b'}}>No booking details found.</p>
      </div>
    );
  }

  // Generate booking ID
  const bookingId = `BK-${Math.floor(Math.random() * 100000000)}`;

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        {/* Success Icon */}
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="confirmation-message">You're all set. A receipt has been sent to your email.</p>

        {/* Booking Details */}
        <div className="details-section">
          <div className="detail-row">
            <span className="label">Booking ID</span>
            <span className="value">{bookingId}</span>
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
              {booking.driverType === "SELF_DRIVE" ? "Self Drive" : "With driver"}
            </span>
          </div>

          <div className="detail-row">
            <span className="label">Method</span>
            <span className="value">
              {paymentMethod === "UPI" ? "UPI" : 
               paymentMethod === "CARD" ? "Credit/Debit Card" : 
               "Cash on pickup"}
            </span>
          </div>

          <div className="detail-row highlight">
            <span className="label">Total paid</span>
            <span className="value">₹{booking.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-bookings"
            onClick={() => navigate("/my-bookings")}
          >
            View My Bookings
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
