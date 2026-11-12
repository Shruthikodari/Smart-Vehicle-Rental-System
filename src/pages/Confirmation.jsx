import { useNavigate, useLocation } from "react-router-dom";
import StatusTimeline from "../components/StatusTimeline";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/confirmation.css";

const methodLabel = {
  UPI: "UPI",
  CARD: "Debit / credit card",
  CASH: "Cash at pickup",
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Booking as saved by the backend
  const { booking } = location.state || {};

  if (!booking) {
    return (
      <div>
        <SiteHeader />
        <div className="container page"><p>No booking details found.</p></div>
      </div>
    );
  }

  const isCash = booking.paymentMethod === "CASH";

  return (
    <div>
      <SiteHeader />
      <div className="container page">
        <div className="confirmation-card panel">
          <h1>Request sent</h1>
          <p className="confirmation-message">
            Thanks, {booking.customerName.split(" ")[0]}. We've received your booking request and our team will review it shortly.
            You'll get a notification when it's approved.
          </p>

          <StatusTimeline status={booking.status} />

          <div className="details-section">
            <div className="detail-row"><span className="label">Booking ID</span><span className="value">{booking.bookingCode}</span></div>
            <div className="detail-row"><span className="label">Vehicle</span><span className="value">{booking.vehicleName}</span></div>
            <div className="detail-row"><span className="label">Pick-up location</span><span className="value">{booking.pickupLocation}</span></div>
            <div className="detail-row"><span className="label">Pick-up</span><span className="value">{formatDate(booking.pickupDate)}</span></div>
            <div className="detail-row"><span className="label">Return</span><span className="value">{formatDate(booking.returnDate)}</span></div>
            <div className="detail-row">
              <span className="label">Driver</span>
              <span className="value">
                {booking.driverType === "SELF_DRIVE" ? "Self-drive" : `${booking.driverName} (${booking.driverPhone})`}
              </span>
            </div>
            <div className="detail-row"><span className="label">Payment</span><span className="value">{methodLabel[booking.paymentMethod] || booking.paymentMethod}</span></div>
            {booking.transactionId && (
              <div className="detail-row"><span className="label">Transaction ID</span><span className="value">{booking.transactionId}</span></div>
            )}
            <div className="detail-row highlight">
              <span className="label">{isCash ? "To pay at pickup" : "Amount paid"}</span>
              <span className="value">₹{booking.total}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate(`/history/${booking.bookingCode}`)}>View booking details</button>
            <button className="btn-secondary" onClick={() => navigate("/history")}>Go to My bookings</button>
            <button className="btn-secondary" onClick={() => navigate("/home")}>Browse more vehicles</button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Confirmation;
