import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vehicleImage, handleImageError } from "../services/images";
import API, { errorMessage } from "../services/api";
import "../styles/home.css";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  const filters = [
    { label: "All", value: "ALL" },
    { label: "Cars", value: "CAR" },
    { label: "Bikes", value: "BIKE" },
    { label: "Luxury", value: "LUXURY" },
    { label: "Electric", value: "EV" },
    { label: "SUV", value: "SUV" },
  ];
  const query = search.trim().toLowerCase();
  const visibleVehicles = vehicles
    .filter(v => filter === "ALL" || v.type === filter)
    .filter(v => !query || [v.name, v.brand, v.location, v.fuelType].some(f => f?.toLowerCase().includes(query)));

  // Opens the vehicle details page; login is asked for when the customer continues to book
  const handleBookNow = (vehicleId) => {
    navigate(`/booking/${vehicleId}`, { state: { pickupDate, returnDate } });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Request a larger page size in case backend paginates by default
    API.get('/vehicles', { params: { limit: 100 } })
      .then(res => {
        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
          setVehicles(data);
          return;
        }

        if (data && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
          return;
        }

        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setVehicles(data.data);
          return;
        }

        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setVehicles(data.items);
          return;
        }

        // If the backend returns an object keyed by ids (map), convert to array
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const values = Object.values(data).filter(v => v && typeof v === 'object' && v.id);
          if (values.length > 0) {
            setVehicles(values);
            return;
          }
        }

        setError('No vehicles returned from backend. Response: ' + JSON.stringify(data).substring(0, 200));
      })
      .catch(err => {
        console.error('Failed to fetch vehicles from backend', err);
        setError(errorMessage(err, 'Could not load vehicles'));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">

      {/* TOP BAR */}
      <nav className="home-nav">
        <span className="home-logo" onClick={() => navigate('/')}>🚗 SmartRide</span>
        <div className="home-nav-links">
          {user ? (
            <>
              <span className="home-user">Hi, {user.name?.split(' ')[0]}</span>
              <button className="view-all" onClick={() => navigate('/dashboard')}>My Dashboard</button>
              <button className="pill" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="pill" onClick={() => navigate('/login')}>Login</button>
              <button className="view-all" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO / SEARCH */}
      <section className="hero-search">
        <div className="hero-text">
          <p className="eyebrow">FIND YOUR RIDE</p>
          <h1>Where do you want to <span>explore?</span></h1>
          <p className="sub">Pick a city, set your dates, and hit the road in under 90 seconds.</p>
        </div>

        <form className="search-card" onSubmit={(e) => { e.preventDefault(); document.querySelector('.grid')?.scrollIntoView({ behavior: 'smooth' }); }}>
          <div className="field">
            <label>Search</label>
            <input
              type="text"
              placeholder="Car, brand or area"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Pick-up Date</label>
            <input type="date" value={pickupDate} min={new Date().toISOString().slice(0,10)} onChange={(e) => setPickupDate(e.target.value)} />
          </div>

          <div className="field">
            <label>Return Date</label>
            <input type="date" value={returnDate} min={pickupDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>

          <button className="search-btn">Search</button>
        </form>
      </section>

      {/* FILTERS + TITLE */}
      <div className="section-header">
        <div className="filters">
          {filters.map(f => (
            <button
              key={f.value}
              className={`pill ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="heading-row">
          <div>
            <p className="eyebrow small">FEATURED</p>
            <h2 className="title">Hand-picked rides, ready today</h2>
          </div>

          <button className="view-all" onClick={() => navigate('/dashboard')}>My Dashboard →</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid">
        {loading && (
          <div style={{gridColumn: '1/-1', color:'#bbb', padding: '40px 20px', textAlign:'center'}}>Loading vehicles...</div>
        )}
        {error && (
          <div style={{gridColumn: '1/-1', color:'#ff6b6b', padding: '40px 20px', textAlign:'center'}}>Error: {error}</div>
        )}
        {!loading && !error && visibleVehicles.length > 0 ? visibleVehicles.map((v) => (
          <div className="card" key={v.id}>

            {/* IMAGE */}
            <div className="image-box">
              <img src={vehicleImage(v.imageUrl)} onError={handleImageError} alt={v.name} />

              <span className="badge">{v.type}</span>
              <span className="rating">⭐ {v.rating}</span>
            </div>

            {/* DETAILS */}
            <div className="card-body">
              <div className="brand">{v.brand || v.name.split(' ')[0].toUpperCase()}</div>
              <h3 className="car-name">{v.name}</h3>

              <p className="location">📍 {v.location}</p>

              <div className="attributes">
                <span>{v.type === 'EV' ? '🔋' : '⛽'} {v.fuelType}</span>
                <span>👥 {v.seatingCapacity}</span>
                <span>🏁 {v.mileage} {v.type === 'EV' ? 'km' : 'kmpl'}</span>
              </div>

              <div className="bottom">
                <div className="price">
                  <span className="rupee">₹</span>
                  <span className="amount">{v.pricePerDay}</span>
                  <span className="per">/day</span>
                </div>

                <button
                  className="book-btn"
                  disabled={v.status === 'MAINTENANCE'}
                  onClick={() => handleBookNow(v.id)}
                >
                  {v.status === 'MAINTENANCE' ? 'Unavailable' : 'View & Book'}
                </button>
              </div>
            </div>

          </div>
        )) : !loading && !error && (
          <div style={{gridColumn: '1/-1', color:'#bbb', padding: '40px 20px', textAlign:'center'}}>No vehicles found.</div>
        )}
      </div>

    </div>
  );
};

export default Home;