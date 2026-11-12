import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { vehicleImage, handleImageError } from "../services/images";
import API, { errorMessage } from "../services/api";
import { todayIso } from "../services/format";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/booking.css";

const DAY = 86400000;
const isoPlus = (iso, days) => new Date(new Date(iso).getTime() + days * DAY).toISOString().slice(0, 10);

// Step 1 of booking (login required): dates, driver option, availability and price
const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const today = todayIso();
  const initialPickup = location.state?.pickupDate >= today ? location.state.pickupDate : today;
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState(null);
  const [pickupDate, setPickupDate] = useState(initialPickup);
  const [returnDate, setReturnDate] = useState(location.state?.returnDate > initialPickup ? location.state.returnDate : isoPlus(initialPickup, 1));
  const [driverType, setDriverType] = useState(location.state?.driverType || "SELF_DRIVE");
  // Availability answer from the backend, remembered for the dates it was asked about
  const [availability, setAvailability] = useState({ key: "", available: null, driverAvailable: null, error: "" });
  const datesKey = `${pickupDate}|${returnDate}`;
  const available = availability.key === datesKey ? availability.available : null;
  const driverAvailable = availability.key === datesKey ? availability.driverAvailable : null;
  const availabilityError = availability.key === datesKey ? availability.error : "";

  useEffect(() => {
    API.get(`/vehicles/${id}`)
      .then(res => setVehicle(res.data))
      .catch(err => setError(errorMessage(err, "Could not load this vehicle")));
  }, [id]);

  // Ask the backend whether the vehicle (and a driver) is free for the chosen dates
  useEffect(() => {
    if (!pickupDate || !returnDate || returnDate <= pickupDate) return;
    let cancelled = false;
    const key = `${pickupDate}|${returnDate}`;
    API.get(`/vehicles/${id}/availability`, { params: { from: pickupDate, to: returnDate } })
      .then(res => { if (!cancelled) setAvailability({ key, ...res.data, error: "" }); })
      .catch(err => { if (!cancelled) setAvailability({ key, available: null, driverAvailable: null, error: errorMessage(err) }); });
    return () => { cancelled = true; };
  }, [id, pickupDate, returnDate]);

  const shell = (content) => (
    <div>
      <SiteHeader />
      <div className="container page">{content}</div>
      <SiteFooter />
    </div>
  );

  if (error) return shell(<div className="form-error">{error}</div>);
  if (!vehicle) return shell(<p className="muted">Loading...</p>);

  const isBike = vehicle.type === "BIKE";
  const days = Math.max(0, Math.round((new Date(returnDate) - new Date(pickupDate)) / DAY));
  const datesValid = pickupDate >= today && days > 0;
  const withDriver = !isBike && driverType === "WITH_DRIVER";
  const canContinue = datesValid && available === true && (!withDriver || driverAvailable === true);
  const basePrice = vehicle.pricePerDay * days;
  const taxes = Math.round(basePrice * 0.05);
  const driverCost = withDriver ? 500 * days : 0;
  const total = basePrice + taxes + driverCost;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate(`/payment/${id}`, {
      state: {
        booking: {
          vehicleId: Number(id),
          vehicleName: vehicle.name,
          pickupLocation: vehicle.location,
          pickupDate,
          returnDate,
          days,
          driverType: withDriver ? "WITH_DRIVER" : "SELF_DRIVE",
          basePrice,
          taxes,
          driverCost,
          total,
        },
      },
    });
  };

  let status = null;
  if (!datesValid) {
    status = <p className="note note-error">{pickupDate < today ? "Pick-up date can't be in the past." : "Return date must be after the pick-up date."}</p>;
  } else if (availabilityError) {
    status = <p className="note note-error">{availabilityError}</p>;
  } else if (vehicle.status === "MAINTENANCE") {
    status = <p className="note note-error">This vehicle is being serviced and can't be booked right now.</p>;
  } else if (available === false) {
    status = <p className="note note-error">Already booked for some of these dates. Please try different dates.</p>;
  } else if (available === true && withDriver && driverAvailable === false) {
    status = <p className="note note-error">No drivers are free on these dates. Choose self-drive or change the dates.</p>;
  } else if (available === true) {
    status = <p className="note note-ok">Available for your dates{withDriver ? ", and a driver will be assigned" : ""}.</p>;
  }

  return shell(
    <>
      <button className="back-link" onClick={() => navigate(`/vehicle/${id}`)}>← Back to vehicle details</button>
      <h1 className="page-title">Book your rental</h1>
      <p className="page-subtitle">Step 1 of 2 · Choose dates and driver</p>

      <div className="checkout-grid">
        <div className="panel booking-step">
          <div className="vehicle-summary">
            <img src={vehicleImage(vehicle.imageUrl)} onError={handleImageError} alt={vehicle.name} />
            <div>
              <h2>{vehicle.name}</h2>
              <p>{vehicle.location} · ₹{vehicle.pricePerDay} per day</p>
            </div>
          </div>

          <div className="date-row">
            <div>
              <label>Pick-up date</label>
              <input type="date" value={pickupDate} min={today} onChange={(e) => setPickupDate(e.target.value)} />
            </div>
            <div>
              <label>Return date</label>
              <input type="date" value={returnDate} min={isoPlus(pickupDate, 1)} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
          </div>

          {!isBike && (
            <div className="driver-options">
              <label>Driver</label>
              <div className="driver-choices">
                <button
                  className={`driver-choice ${driverType === "SELF_DRIVE" ? "active" : ""}`}
                  onClick={() => setDriverType("SELF_DRIVE")}
                >
                  <span className="choice-label">Self-drive</span>
                  <span className="choice-desc">You drive</span>
                </button>
                <button
                  className={`driver-choice ${driverType === "WITH_DRIVER" ? "active" : ""}`}
                  onClick={() => setDriverType("WITH_DRIVER")}
                >
                  <span className="choice-label">With driver</span>
                  <span className="choice-desc">+ ₹500 per day</span>
                </button>
              </div>
            </div>
          )}

          {status}
        </div>

        <aside className="panel booking-summary">
          <h3>Price details</h3>
          <div className="price-row"><span>₹{vehicle.pricePerDay} × {days} day{days === 1 ? "" : "s"}</span><span>₹{basePrice}</span></div>
          {driverCost > 0 && <div className="price-row"><span>Driver ({days} day{days === 1 ? "" : "s"})</span><span>₹{driverCost}</span></div>}
          <div className="price-row"><span>Tax (5%)</span><span>₹{taxes}</span></div>
          <div className="price-row total"><span>Total</span><span>₹{total}</span></div>
          <button className="btn-primary proceed-btn" onClick={handleContinue} disabled={!canContinue}>
            {datesValid && available === null && !availabilityError ? "Checking availability..." : "Continue to payment"}
          </button>
        </aside>
      </div>
    </>
  );
};

export default Booking;
