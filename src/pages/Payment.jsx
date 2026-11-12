import { useState } from "react";
import { Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../services/api";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/payment.css";

const METHODS = [
  { value: "UPI", label: "UPI", note: "GPay, PhonePe, Paytm" },
  { value: "CARD", label: "Debit / credit card", note: "Visa, Mastercard, RuPay" },
  { value: "CASH", label: "Cash at pickup", note: "Pay when you collect" },
];

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

const Payment = () => {
  const { id } = useParams();
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

  // Opened directly (e.g. page refresh): go back to step 1 for this vehicle
  if (!bookingData) {
    return <Navigate to={`/booking/${id}`} replace />;
  }

  const validate = () => {
    if (paymentMethod === "UPI" && !/^[\w.-]+@[\w]+$/.test(upiId.trim())) return "Please enter a valid UPI ID, for example name@okhdfcbank";
    if (paymentMethod === "CARD") {
      if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) return "Please enter a valid 16-digit card number";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return "Please enter the expiry date as MM/YY";
      if (!/^\d{3}$/.test(cvv)) return "Please enter the 3-digit CVV";
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
    <div>
      <SiteHeader />
      <div className="container page">
        <button className="back-link" onClick={() => navigate(`/booking/${id}`, { state: bookingData })}>← Change dates or driver</button>
        <h1 className="page-title">Payment</h1>
        <p className="page-subtitle">Step 2 of 2 · Booking as {user.name} ({user.email}, {user.phone})</p>

        <div className="checkout-grid">
          <div className="panel payment-card">
            <h3>Payment method</h3>
            <div className="payment-methods">
              {METHODS.map(m => (
                <label key={m.value} className={`payment-option ${paymentMethod === m.value ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="method"
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                  />
                  <span>
                    <strong>{m.label}</strong>
                    <small>{m.note}</small>
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === "UPI" && (
              <div className="payment-form">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === "CARD" && (
              <div className="payment-form">
                <label>Card number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
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
              <p className="payment-info">Pay the full amount in cash when you collect the vehicle. Please carry exact change if possible.</p>
            )}

            {error && <div className="form-error">{error}</div>}

            <button className="btn-primary pay-btn" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Sending request..." : paymentMethod === "CASH" ? "Send booking request" : `Pay ₹${bookingData.total} and send request`}
            </button>
            <p className="fine-print">
              Your booking is confirmed once our team approves it. If it can't be approved, online payments are refunded in full.
            </p>
          </div>

          <aside className="panel booking-summary">
            <h3>{bookingData.vehicleName}</h3>
            <p className="muted">{bookingData.pickupLocation}</p>
            <div className="summary-dates">
              <div><span>Pick-up</span><strong>{formatDate(bookingData.pickupDate)}</strong></div>
              <div><span>Return</span><strong>{formatDate(bookingData.returnDate)}</strong></div>
            </div>
            <div className="summary-row"><span>Rent ({bookingData.days} day{bookingData.days === 1 ? "" : "s"})</span><span>₹{bookingData.basePrice}</span></div>
            {bookingData.driverCost > 0 && (
              <div className="summary-row"><span>Driver</span><span>₹{bookingData.driverCost}</span></div>
            )}
            <div className="summary-row"><span>Tax (5%)</span><span>₹{bookingData.taxes}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{bookingData.total}</span></div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Payment;
