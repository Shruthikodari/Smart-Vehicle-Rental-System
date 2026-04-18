import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.booking;
  
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  if (!bookingData) {
    return (
      <div className="payment-container">
        <p style={{color: '#ff6b6b'}}>No booking details found. Please start from home.</p>
      </div>
    );
  }

  const handleConfirm = () => {
    navigate("/confirmation", {
      state: { 
        booking: bookingData,
        paymentMethod 
      }
    });
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <span className="step-badge">STEP 2 OF 3</span>
          <h1>Complete your payment</h1>
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
            />
            <div className="card-details">
              <div>
                <label>Expiry</label>
                <input type="text" placeholder="MM/YY" maxLength="5" />
              </div>
              <div>
                <label>CVV</label>
                <input type="text" placeholder="123" maxLength="3" />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "CASH" && (
          <div className="payment-info">
            <p>You can pay with cash at the pickup location. A receipt will be provided.</p>
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

        <button className="btn-confirm" onClick={handleConfirm}>
          🔒 Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default Payment;
