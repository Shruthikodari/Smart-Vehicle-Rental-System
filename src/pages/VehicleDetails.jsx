import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API, { errorMessage } from "../services/api";
import { vehicleImage, handleImageError } from "../services/images";
import { formatDate, todayIso } from "../services/format";
import { Stars } from "../components/ReviewForm";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/booking.css";

// Public page: anyone can look at a vehicle; booking it asks for a login first
const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/vehicles/${id}`)
      .then(res => setVehicle(res.data))
      .catch(err => setError(errorMessage(err, "Could not load this vehicle")));
    API.get(`/vehicles/${id}/reviews`).then(res => setReviews(res.data)).catch(() => {});
  }, [id]);

  const bookNow = () => {
    // /booking is a protected route: guests are sent to login and brought straight back here
    navigate(`/booking/${id}`, { state: { pickupDate: location.state?.pickupDate, returnDate: location.state?.returnDate } });
  };

  const shell = (content) => (
    <div>
      <SiteHeader />
      <div className="container page">{content}</div>
      <SiteFooter />
    </div>
  );

  if (error) return shell(<div className="form-error">{error}</div>);
  if (!vehicle) return shell(<p className="muted">Loading vehicle...</p>);

  const inService = vehicle.status === "MAINTENANCE";

  return shell(
    <>
      <button className="back-link" onClick={() => navigate("/home")}>← Back to all vehicles</button>
      <div className="booking-grid">
        <div className="booking-vehicle">
          <img src={vehicleImage(vehicle.imageUrl)} onError={handleImageError} alt={vehicle.name} className="booking-image" />
          <h1>{vehicle.name}</h1>
          <p className="booking-type">
            {vehicle.brand} · {vehicle.location} · <span className="stars-gold">★</span> {vehicle.rating} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
          </p>

          <div className="vehicle-specs">
            <div><span>Fuel</span><strong>{vehicle.fuelType}</strong></div>
            <div><span>Gearbox</span><strong>{vehicle.transmission}</strong></div>
            <div><span>Seats</span><strong>{vehicle.seatingCapacity}</strong></div>
            <div><span>{vehicle.type === "EV" ? "Range" : "Mileage"}</span><strong>{vehicle.mileage} {vehicle.type === "EV" ? "km" : "kmpl"}</strong></div>
          </div>

          <div className="vehicle-reviews">
            <h3>Customer reviews</h3>
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              reviews.slice(0, 6).map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-head">
                    <strong>{r.customerName}</strong>
                    <span className="review-stars"><Stars value={r.vehicleRating} /></span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <small>{formatDate(r.createdAt)}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="booking-form-section panel">
          <div className="price-head">
            <strong>₹{vehicle.pricePerDay}</strong> <span className="muted">per day</span>
          </div>
          <ul className="details-points">
            <li>5% tax added at checkout</li>
            {vehicle.type !== "BIKE" && <li>Driver available for ₹500 per day</li>}
            <li>Free cancellation until the day before pickup</li>
            <li>Pick up at {vehicle.location}</li>
          </ul>
          {inService ? (
            <p className="note note-error">This vehicle is being serviced and can't be booked right now.</p>
          ) : (
            <button className="btn-primary proceed-btn" onClick={bookNow}>Book now</button>
          )}
          {!user && !inService && (
            <p className="fine-print">You'll be asked to log in or sign up, then brought back here to pick your dates.</p>
          )}
          {location.state?.pickupDate && location.state.pickupDate >= todayIso() && (
            <p className="fine-print">Your search: {formatDate(location.state.pickupDate, false)} – {formatDate(location.state.returnDate, false)}</p>
          )}
        </aside>
      </div>
    </>
  );
};

export default VehicleDetails;
