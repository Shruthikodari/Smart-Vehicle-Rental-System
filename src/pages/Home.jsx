import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "../styles/home.css";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBookNow = (vehicleId) => {
    // Proceed directly to booking without requiring a login page
    navigate(`/booking/${vehicleId}`);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Request a larger page size in case backend paginates by default
    API.get('/vehicles', { params: { limit: 100 } })
      .then(res => {
        const data = res.data;
        console.log('vehicles fetch response:', data);
        console.log('response status:', res.status);
        console.log('response headers:', res.headers);

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
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        console.error('Error response:', err.response?.data);
        const errorMsg = err.response?.data?.message || err.message || 'Fetch failed';
        setError(`Backend Error: ${errorMsg} | Status: ${err.response?.status || 'unknown'} | Check console for details.`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">

      {/* HERO / SEARCH */}
      <section className="hero-search">
        <div className="hero-text">
          <p className="eyebrow">FIND YOUR RIDE</p>
          <h1>Where do you want to <span>explore?</span></h1>
          <p className="sub">Pick a city, set your dates, and hit the road in under 90 seconds.</p>
        </div>

        <form className="search-card" onSubmit={(e) => { e.preventDefault(); /* optional: trigger search */ }}>
          <div className="field">
            <label>City</label>
            <select defaultValue="Mumbai">
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bengaluru</option>
            </select>
          </div>

          <div className="field">
            <label>Pick-up Date</label>
            <input type="date" defaultValue={new Date().toISOString().slice(0,10)} />
          </div>

          <div className="field">
            <label>Return Date</label>
            <input type="date" defaultValue={new Date(Date.now()+86400000).toISOString().slice(0,10)} />
          </div>

          <button className="search-btn">Search</button>
        </form>
      </section>

      {/* FILTERS + TITLE */}
      <div className="section-header">
        <div className="filters">
          <button className="pill active">All</button>
          <button className="pill">Cars</button>
          <button className="pill">Bikes</button>
          <button className="pill">Luxury</button>
          <button className="pill">Electric</button>
          <button className="pill">SUV</button>
        </div>

        <div className="heading-row">
          <div>
            <p className="eyebrow small">FEATURED</p>
            <h2 className="title">Hand-picked rides, ready today</h2>
          </div>

          <button className="view-all">View All →</button>
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
        {!loading && !error && vehicles && vehicles.length > 0 ? vehicles.map((v) => (
          <div className="card" key={v.id}>

            {/* IMAGE */}
            <div className="image-box">
              <img src={v.imageUrl} alt={v.name} />

              <span className="badge">{v.type}</span>
              <span className="rating">⭐ { (Math.random()*1.5 + 4.4).toFixed(1) }</span>
            </div>

            {/* DETAILS */}
            <div className="card-body">
              <div className="brand">{v.name.split(' ')[0].toUpperCase()}</div>
              <h3 className="car-name">{v.name}</h3>

              <p className="location">📍 {v.location}</p>

              <div className="attributes">
                <span>{v.type === 'BIKE' ? '⛽ Fuel' : v.type === 'EV' ? '🔋 Range' : '⛽ Petrol'}</span>
                <span>👥 5</span>
                <span>🏁 {v.mileage || 17} {v.type === 'EV' ? 'km' : 'kmpl'}</span>
              </div>

              <div className="bottom">
                <div className="price">
                  <span className="rupee">₹</span>
                  <span className="amount">{v.pricePerDay}</span>
                  <span className="per">/day</span>
                </div>

                <button
                  className="book-btn"
                  disabled={v.status === 'BOOKED'}
                  onClick={() => handleBookNow(v.id)}
                >
                  {v.status === 'BOOKED' ? 'Booked' : 'Book Now'}
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