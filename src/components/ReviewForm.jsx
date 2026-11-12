import { useState } from "react";
import API, { errorMessage } from "../services/api";

// Clickable 1-5 star picker
export const StarInput = ({ value, onChange }) => (
  <span className="star-input">
    {[1, 2, 3, 4, 5].map(n => (
      <button type="button" key={n} className={n <= value ? "on" : ""} onClick={() => onChange(n)} aria-label={`${n} stars`}>★</button>
    ))}
  </span>
);

export const Stars = ({ value }) => (
  <span className="stars-gold">{"★".repeat(value)}{"☆".repeat(5 - value)}</span>
);

// Review for one completed rental (vehicle rating, driver rating if there was a driver, comment)
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
        <span>{booking.vehicleName}</span>
        <StarInput value={vehicleRating} onChange={setVehicleRating} />
      </div>
      {booking.driverName && (
        <div className="review-row">
          <span>Driver: {booking.driverName}</span>
          <StarInput value={driverRating} onChange={setDriverRating} />
        </div>
      )}
      <textarea
        placeholder="How was the vehicle and pickup? (optional)"
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <div className="form-error">{error}</div>}
      <button className="btn-primary" onClick={submit} disabled={saving}>
        {saving ? "Submitting..." : "Submit review"}
      </button>
    </div>
  );
};

export default ReviewForm;
