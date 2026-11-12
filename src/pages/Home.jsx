import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { vehicleImage, handleImageError } from "../services/images";
import API, { errorMessage } from "../services/api";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/home.css";

const TYPES = [
  { label: "All types", value: "ALL" },
  { label: "Cars", value: "CAR" },
  { label: "SUVs", value: "SUV" },
  { label: "Luxury", value: "LUXURY" },
  { label: "Electric", value: "EV" },
  { label: "Bikes", value: "BIKE" },
];

const TYPE_LABEL = { CAR: "Car", SUV: "SUV", LUXURY: "Luxury", EV: "Electric", BIKE: "Bike" };

const cityOf = (location = "") => location.split(",").pop().trim();

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [city, setCity] = useState(location.state?.city || "ALL");
  const [sort, setSort] = useState("rating");
  const today = new Date().toISOString().slice(0, 10);
  const [pickupDate, setPickupDate] = useState(location.state?.pickupDate || today);
  const [returnDate, setReturnDate] = useState(() =>
    location.state?.returnDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  useEffect(() => {
    API.get("/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => setError(errorMessage(err, "Could not load vehicles")))
      .finally(() => setLoading(false));
  }, []);

  const cities = [...new Set(vehicles.map(v => cityOf(v.location)))].sort();
  const query = search.trim().toLowerCase();
  const visible = vehicles
    .filter(v => type === "ALL" || v.type === type)
    .filter(v => city === "ALL" || cityOf(v.location) === city)
    .filter(v => !query || [v.name, v.brand, v.location, v.fuelType].some(f => f?.toLowerCase().includes(query)))
    .sort((a, b) => sort === "price-low" ? a.pricePerDay - b.pricePerDay
      : sort === "price-high" ? b.pricePerDay - a.pricePerDay
      : b.rating - a.rating);

  // Opens the vehicle details page; login is asked for when the customer continues to book
  const openVehicle = (vehicleId) => {
    navigate(`/vehicle/${vehicleId}`, { state: { pickupDate, returnDate } });
  };

  return (
    <div className="home">
      <SiteHeader />

      <div className="container page">
        <h1 className="page-title">Browse vehicles</h1>
        <p className="page-subtitle">Choose your dates, then pick a vehicle to see the full price and availability.</p>

        <div className="browse-layout">
          {/* Filters */}
          <aside className="filters panel">
            <label>Search</label>
            <input
              type="text"
              placeholder="Model, brand or area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="ALL">All cities</option>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>

            <label>Pick-up date</label>
            <input type="date" value={pickupDate} min={today} onChange={(e) => setPickupDate(e.target.value)} />

            <label>Return date</label>
            <input type="date" value={returnDate} min={pickupDate} onChange={(e) => setReturnDate(e.target.value)} />

            <label>Vehicle type</label>
            <div className="type-list">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  className={`type-option ${type === t.value ? "active" : ""}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Results */}
          <section>
            <div className="results-bar">
              <span>{loading ? "Loading..." : `${visible.length} vehicle${visible.length === 1 ? "" : "s"} found`}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
                <option value="rating">Sort: Highest rated</option>
                <option value="price-low">Sort: Price, low to high</option>
                <option value="price-high">Sort: Price, high to low</option>
              </select>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="grid">
              {visible.map(v => (
                <div className="card panel" key={v.id}>
                  <div className="image-box">
                    <img src={vehicleImage(v.imageUrl)} onError={handleImageError} alt={v.name} />
                    <span className="badge">{TYPE_LABEL[v.type] || v.type}</span>
                  </div>

                  <div className="card-body">
                    <div className="card-title-row">
                      <h3 className="car-name">{v.name}</h3>
                      <span className="rating"><span className="stars-gold">★</span> {v.rating}</span>
                    </div>
                    <p className="location">{v.location}</p>

                    <div className="attributes">
                      <span>{v.fuelType}</span>
                      <span>{v.transmission}</span>
                      <span>{v.seatingCapacity} seats</span>
                      <span>{v.mileage} {v.type === "EV" ? "km range" : "kmpl"}</span>
                    </div>

                    <div className="bottom">
                      <div className="price">
                        <span className="amount">₹{v.pricePerDay}</span>
                        <span className="per"> / day</span>
                      </div>
                      <button
                        className="btn-primary"
                        disabled={v.status === "MAINTENANCE"}
                        onClick={() => openVehicle(v.id)}
                      >
                        {v.status === "MAINTENANCE" ? "Under service" : "View details"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && !error && visible.length === 0 && (
                <p className="empty-results">No vehicles match these filters. Try another city or type.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Home;
