import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/booking.css";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [driverType, setDriverType] = useState("SELF_DRIVE");

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
  }, [id]);

  if (loading) return <div className="booking-container"><p>Loading vehicle...</p></div>;
  if (error) return <div className="booking-container"><p style={{color: '#ff6b6b'}}>{error}</p></div>;
  if (!vehicle) return <div className="booking-container"><p>Vehicle not found</p></div>;

  const pickup = new Date(pickupDate);
  const returnDt = new Date(returnDate);
  const days = Math.ceil((returnDt - pickup) / (1000 * 60 * 60 * 24));
  const basePrice = vehicle.pricePerDay * days;
  const taxes = Math.round(basePrice * 0.05);
  const driverCost = driverType === "WITH_DRIVER" ? 500 * days : 0;
  const total = basePrice + taxes + driverCost;

  const handleContinueToPayment = () => {
    const bookingData = {
      vehicleId: id,
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
    navigate("/payment", { state: { booking: bookingData } });
  };

  return (
    <div className="booking-container">
      <div className="booking-grid">
        {/* Left: Vehicle Details */}
        <div className="booking-vehicle">
          <img src={vehicle.imageUrl} alt={vehicle.name} className="booking-image" />
          <h1>{vehicle.name}</h1>
          <p className="booking-type">{vehicle.type}</p>

          <div className="vehicle-specs">
            <div>
              <label>Mileage</label>
              <p>{vehicle.mileage} {vehicle.type === 'EV' ? 'km' : 'kmpl'}</p>
            </div>
            <div>
              <label>Location</label>
              <p>{vehicle.location}</p>
            </div>
            <div>
              <label>Status</label>
              <p style={{color: vehicle.status === 'AVAILABLE' ? '#00dd00' : '#ff6b6b'}}>
                {vehicle.status}
              </p>
            </div>
            <div>
              <label>Price/Day</label>
              <p>₹{vehicle.pricePerDay}</p>
            </div>
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
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Return Date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate}
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

          <button className="proceed-btn" onClick={handleContinueToPayment}>Continue to Payment →</button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
