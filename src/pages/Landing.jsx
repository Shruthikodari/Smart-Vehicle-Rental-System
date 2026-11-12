import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { vehicleImage, handleImageError } from "../services/images";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/landing.css";

const cityOf = (location = "") => location.split(",").pop().trim();

const Landing = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [vehicleLoadError, setVehicleLoadError] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(() => new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));

  useEffect(() => {
    API.get("/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => setVehicleLoadError(errorMessage(err, "Could not load vehicles")));
  }, []);

  const cities = [...new Set(vehicles.map(v => cityOf(v.location)))].sort();
  const popular = [...vehicles].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const startingPrice = vehicles.length ? Math.min(...vehicles.map(v => v.pricePerDay)) : null;

  const search = (e) => {
    e.preventDefault();
    navigate("/home", { state: { city, pickupDate, returnDate } });
  };

  return (
    <div className="landing">
      <SiteHeader />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Self-drive cars and bikes, by the day</h1>
            <p>
              Pick up from HITEC City, Gachibowli, Banjara Hills, the airport and other spots around Hyderabad.
              Prefer not to drive? Add a driver for ₹500 a day.
            </p>
            <ul className="hero-points">
              <li>Prices shown upfront, including 5% tax</li>
              <li>Free cancellation until the day before pickup</li>
              <li>Pay by UPI, card, or cash at pickup</li>
            </ul>
          </div>

          <form className="hero-search panel" onSubmit={search}>
            <h3>Find a vehicle</h3>
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {(cities.length ? cities : ["Hyderabad"]).map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="hero-dates">
              <div>
                <label>Pick-up</label>
                <input type="date" value={pickupDate} min={today} onChange={(e) => setPickupDate(e.target.value)} />
              </div>
              <div>
                <label>Return</label>
                <input type="date" value={returnDate} min={pickupDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary hero-btn">Show available vehicles</button>
          </form>
        </div>
      </section>

      {vehicleLoadError && (
        <div className="container" role="alert">
          <div className="form-error">{vehicleLoadError}</div>
        </div>
      )}

      {/* Facts from the database */}
      {vehicles.length > 0 && (
        <section className="container facts">
          <div><strong>{vehicles.length}</strong><span>vehicles to choose from</span></div>
          <div><strong>{cities.length}</strong><span>cities ({cities.join(", ")})</span></div>
          <div><strong>₹{startingPrice}</strong><span>per day, starting price</span></div>
          <div><strong>{(vehicles.reduce((s, v) => s + v.rating, 0) / vehicles.length).toFixed(1)} / 5</strong><span>average customer rating</span></div>
        </section>
      )}

      {/* How it works */}
      <section className="container section">
        <h2>How renting works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-no">1</span>
            <h4>Choose a vehicle and dates</h4>
            <p>See the price for your dates before you sign in. Add a driver if you need one.</p>
          </div>
          <div className="step">
            <span className="step-no">2</span>
            <h4>Send a booking request</h4>
            <p>Pay online or choose cash at pickup. Our team checks the request and confirms it, usually within a few hours.</p>
          </div>
          <div className="step">
            <span className="step-no">3</span>
            <h4>Pick up and drive</h4>
            <p>Bring your driving licence and an ID proof. You will get a reminder the day before pickup.</p>
          </div>
        </div>
      </section>

      {/* Highest rated vehicles */}
      {popular.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <h2>Highest rated by customers</h2>
            <button className="btn-secondary" onClick={() => navigate("/home")}>See all vehicles</button>
          </div>
          <div className="popular-grid">
            {popular.map(v => (
              <div key={v.id} className="popular-card panel" onClick={() => navigate(`/vehicle/${v.id}`)}>
                <img src={vehicleImage(v.imageUrl)} onError={handleImageError} alt={v.name} />
                <div className="popular-body">
                  <h4>{v.name}</h4>
                  <p className="muted">{v.location}</p>
                  <p><strong>₹{v.pricePerDay}</strong> / day · <span className="stars-gold">★</span> {v.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="container section">
        <h2>Common questions</h2>
        <div className="faq">
          <div>
            <h4>What documents do I need?</h4>
            <p>A valid driving licence for the vehicle type and one government ID (Aadhaar, passport or voter ID).</p>
          </div>
          <div>
            <h4>When is my booking confirmed?</h4>
            <p>After our team approves the request. You will see the status change in My bookings and get a notification.</p>
          </div>
          <div>
            <h4>What if I need to cancel?</h4>
            <p>Cancel from My bookings any time before the pickup day. Online payments are refunded in full.</p>
          </div>
          <div>
            <h4>Can I book with a driver?</h4>
            <p>Yes, for cars and SUVs. We assign one of our verified drivers for ₹500 per day.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Landing;
