import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleImage, handleImageError } from "../services/images";
import API, { errorMessage } from "../services/api";
import "../styles/booking.css";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupDate, setPickupDate] = useState(location.state?.pickupDate || today);
  const [returnDate, setReturnDate] = useState(location.state?.returnDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [driverType, setDriverType] = useState(location.state?.driverType || "SELF_DRIVE");
  const [reviews, setReviews] = useState([]);
  // Availability answer from the backend, remembered for the dates it was asked about
  const [availability, setAvailability] = useState({ key: "", available: null, driverAvailable: null, error: "" });
  const datesKey = `${pickupDate}|${returnDate}`;
  const available = availability.key === datesKey ? availability.available : null;
  const driverAvailable = availability.key === datesKey ? availability.driverAvailable : null;
  const availabilityError = availability.key === datesKey ? availability.error : "";

  useEffect(() => {
    setLoading(true);
    API.get(`/vehicles/${id}`)
      .then(res => {
        setVehicle(res.data);
      })
      .catch(err => {
        console.error('Error fetching vehicle:', err);
        setError('Failed to load vehicle details');
      })
      .finally(() => setLoading(false));
    API.get(`/vehicles/${id}/reviews`).then(res => setReviews(res.data)).catch(() => {});
  }, [id]);

  // Ask the backend whether the vehicle is free for the chosen dates
  useEffect(() => {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) return;
    let cancelled = false;
    const key = `${pickupDate}|${returnDate}`;
    API.get(`/vehicles/${id}/availability`, { params: { from: pickupDate, to: returnDate } })
      .then(res => { if (!cancelled) setAvailability({ key, ...res.data, error: "" }); })
      .catch(err => { if (!cancelled) setAvailability({ key, available: null, driverAvailable: null, error: errorMessage(err) }); });
    return () => { cancelled = true; };
  }, [id, pickupDate, returnDate]);

  if (loading) return <div className="booking-container"><p>Loading vehicle...</p></div>;
  if (error) return <div className="booking-container"><p style={{color: '#ff6b6b'}}>{error}</p></div>;
  if (!vehicle) return <div className="booking-container"><p>Vehicle not found</p></div>;

  const pickup = new Date(pickupDate);
  const returnDt = new Date(returnDate);
  const days = Math.max(0, Math.round((returnDt - pickup) / (1000 * 60 * 60 * 24)));
  const datesValid = pickupDate >= today && days > 0;
  const driverOk = driverType === "SELF_DRIVE" || driverAvailable === true;
  const canContinue = datesValid && available === true && driverOk;
  const basePrice = vehicle.pricePerDay * days;
  const taxes = Math.round(basePrice * 0.05);
  const driverCost = driverType === "WITH_DRIVER" ? 500 * days : 0;
  const total = basePrice + taxes + driverCost;

  const handleContinueToPayment = () => {
    if (!canContinue) return;
    const bookingData = {
      vehicleId: Number(id),
      vehicleName: vehicle.name,
      pickupLocation: vehicle.location,
      pickupDate,
      returnDate,
      days,
      driverType,
      basePrice,
      taxes,
      driverCost,
      total
    };
    if (!user) {
      // Ask the customer to log in, then come back here with the same choices
      navigate("/login", { state: { from: `/booking/${id}`, fromState: { pickupDate, returnDate, driverType } } });
      return;
    }
    navigate("/payment", { state: { booking: bookingData } });
  };

  return (
    <div className="booking-container">
      <div className="booking-grid">
        {/* Left: Vehicle Details */}
        <div className="booking-vehicle">
          <img src={vehicleImage(vehicle.imageUrl)} onError={handleImageError} alt={vehicle.name} className="booking-image" />
          <h1>{vehicle.name}</h1>
          <p className="booking-type">
            {vehicle.type} · ⭐ {vehicle.rating} ({reviews.length} review{reviews.length === 1 ? "" : "s"})
          </p>

          <div className="vehicle-specs">
            <div>
              <label>Mileage</label>
              <p>{vehicle.mileage} {vehicle.type === 'EV' ? 'km/charge' : 'kmpl'}</p>
            </div>
            <div>
              <label>Location</label>
              <p>{vehicle.location}</p>
            </div>
            <div>
              <label>Status</label>
              <p style={{color: vehicle.status === 'MAINTENANCE' ? '#ff6b6b' : '#00dd00'}}>
                {vehicle.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'}
              </p>
            </div>
            <div>
              <label>Price/Day</label>
              <p>₹{vehicle.pricePerDay}</p>
            </div>
            <div>
              <label>Fuel / Gearbox</label>
              <p>{vehicle.fuelType} · {vehicle.transmission}</p>
            </div>
            <div>
              <label>Seats</label>
              <p>{vehicle.seatingCapacity}</p>
            </div>
          </div>

          {/* Customer reviews */}
          <div className="vehicle-reviews">
            <h3>Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="review-empty">No reviews yet.</p>
            ) : (
              reviews.slice(0, 5).map(r => (
                <div key={r.id} className="review-item">
                  <div className="review-head">
                    <strong>{r.customerName}</strong>
                    <span className="review-stars">{"★".repeat(r.vehicleRating)}{"☆".repeat(5 - r.vehicleRating)}</span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <small>{r.createdAt.slice(0, 10)}</small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="booking-form-section">
          <h2>Reserve this ride</h2>

          <div className="form-group">
            <label>Pick-up Date</label>
            <input
              type="date"
              value={pickupDate}
              min={today}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={new Date(new Date(pickupDate).getTime() + 86400000).toISOString().slice(0, 10)}
            />
          </div>

          <div className="driver-options">
            <label>DRIVER OPTION</label>
            <div className="driver-choices">
              <button
                className={`driver-choice ${driverType === 'SELF_DRIVE' ? 'active' : ''}`}
                onClick={() => setDriverType('SELF_DRIVE')}
              >
                <span className="choice-label">SELF-DRIVE</span>
                <span className="choice-desc">YOU TAKE THE WHEEL</span>
              </button>
              <button
                className={`driver-choice ${driverType === 'WITH_DRIVER' ? 'active' : ''}`}
                onClick={() => setDriverType('WITH_DRIVER')}
              >
                <span className="choice-label">WITH DRIVER</span>
                <span className="choice-desc">+ ₹500/DAY</span>
              </button>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>₹{vehicle.pricePerDay} × {days} days</span>
              <span>₹{basePrice}</span>
            </div>
            <div className="price-row">
              <span>Taxes (5%)</span>
              <span>₹{taxes}</span>
            </div>
            {driverCost > 0 && (
              <div className="price-row">
                <span>Driver ({days} days)</span>
                <span>₹{driverCost}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          {!datesValid && (
            <p style={{color: '#ff6b6b', marginBottom: 12}}>
              {pickupDate < today ? 'Pick-up date cannot be in the past.' : 'Return date must be after the pick-up date.'}
            </p>
          )}
          {datesValid && available === false && (
            <p style={{color: '#ff6b6b', marginBottom: 12}}>❌ Not available for these dates. Please pick other dates.</p>
          )}
          {datesValid && available === true && (
            <p style={{color: '#00dd00', marginBottom: 12}}>✓ Available for your dates</p>
          )}
          {datesValid && available === true && driverType === "WITH_DRIVER" && driverAvailable === false && (
            <p style={{color: '#ff6b6b', marginBottom: 12}}>❌ No drivers are free for these dates. Choose self-drive or other dates.</p>
          )}
          {datesValid && available === true && driverType === "WITH_DRIVER" && driverAvailable === true && (
            <p style={{color: '#00dd00', marginBottom: 12}}>✓ A driver will be assigned to you</p>
          )}
          {availabilityError && <p style={{color: '#ff6b6b', marginBottom: 12}}>{availabilityError}</p>}

          <button
            className="proceed-btn"
            onClick={handleContinueToPayment}
            disabled={!canContinue}
            style={!canContinue ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {datesValid && available === null && !availabilityError
              ? 'Checking availability...'
              : user ? 'Continue to Payment →' : 'Log in to Book →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
