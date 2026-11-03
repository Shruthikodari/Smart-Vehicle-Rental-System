import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../services/api";
import "../styles/payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const bookingData = location.state?.booking;

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!bookingData) {
    return (
      <div className="payment-container">
        <p style={{color: '#ff6b6b'}}>No booking details found. Please start from home.</p>
      </div>
    );
  }

  const validate = () => {
    if (paymentMethod === "UPI" && !/^[\w.-]+@[\w]+$/.test(upiId.trim())) return "Please enter a valid UPI ID (e.g. name@okhdfcbank)";
    if (paymentMethod === "CARD") {
      if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) return "Please enter a valid 16-digit card number";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return "Please enter expiry as MM/YY";
      if (!/^\d{3}$/.test(cvv)) return "Please enter a 3-digit CVV";
    }
    return "";
  };

  const handleConfirm = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Payment is simulated; the backend creates a PENDING booking and its payment record together
      const res = await API.post("/bookings", {
        vehicleId: bookingData.vehicleId,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        driverType: bookingData.driverType,
        paymentMethod,
      });
      navigate("/confirmation", { replace: true, state: { booking: res.data } });
    } catch (err) {
      setError(errorMessage(err, "Booking failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <span className="step-badge">STEP 2 OF 3</span>
          <h1>Complete your payment</h1>
        </div>

        <div className="payment-section">
          <h3>Booking for</h3>
          <div className="booking-summary">
            <div className="summary-row">
              <span>{user.name}</span>
              <span>{user.phone}</span>
            </div>
            <div className="summary-row small">
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="payment-section">
          <h3>Choose payment method</h3>
          <div className="payment-methods">
            <button
              className={`payment-option ${paymentMethod === "UPI" ? "active" : ""}`}
              onClick={() => setPaymentMethod("UPI")}
            >
              <div className="payment-icon">📱</div>
              <span>UPI</span>
            </button>

            <button
              className={`payment-option ${paymentMethod === "CARD" ? "active" : ""}`}
              onClick={() => setPaymentMethod("CARD")}
            >
              <div className="payment-icon">💳</div>
              <span>Credit / Debit</span>
            </button>

            <button
              className={`payment-option ${paymentMethod === "CASH" ? "active" : ""}`}
              onClick={() => setPaymentMethod("CASH")}
            >
              <div className="payment-icon">💵</div>
              <span>Cash on pickup</span>
            </button>
          </div>
        </div>

        {paymentMethod === "UPI" && (
          <div className="payment-form">
            <label>UPI ID</label>
            <input
              type="text"
              placeholder="yourname@okhdfcbank"
              className="payment-input"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        )}

        {paymentMethod === "CARD" && (
          <div className="payment-form">
            <label>Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="payment-input"
              maxLength="19"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))}
            />
            <div className="card-details">
              <div>
                <label>Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={expiry}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                  }}
                />
              </div>
              <div>
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength="3"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "CASH" && (
          <div className="payment-info">
            <p>You can pay with cash at the pickup location.</p>
          </div>
        )}

        <div className="booking-summary">
          <h4>Booking Summary</h4>
          <div className="summary-row">
            <span>{bookingData.vehicleName}</span>
            <span>₹{bookingData.total}</span>
          </div>
          <div className="summary-row small">
            <span>{bookingData.days} days</span>
            <span>{bookingData.pickupDate} to {bookingData.returnDate}</span>
          </div>
        </div>

        <p style={{color: '#999', fontSize: 13, margin: '16px 0 0'}}>
          ℹ️ Your booking will be sent to SmartRide for approval. If it is rejected, any payment is refunded.
        </p>

        {error && <p style={{color: '#ff6b6b', margin: '16px 0'}}>{error}</p>}

        <button className="btn-confirm" onClick={handleConfirm} disabled={submitting}>
          {submitting ? "Processing..." : paymentMethod === "CASH" ? "🔒 Submit Booking Request" : `🔒 Pay ₹${bookingData.total} & Submit Request`}
        </button>
      </div>
    </div>
  );
};

export default Payment;
