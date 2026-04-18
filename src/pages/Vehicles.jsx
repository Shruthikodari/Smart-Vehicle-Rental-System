import { useEffect, useState } from "react";
import "../styles/home.css"; // reuse same css

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    fetch("http://localhost:8080/vehicles")
      .then(res => res.json())
      .then(data => {
        console.log("ALL VEHICLES:", data);
        setVehicles(data);
      })
      .catch(err => console.log(err));
  }, []);

  const filtered = vehicles.filter(v =>
    v.location?.toLowerCase().includes(search.toLowerCase()) &&
    (type === "ALL" || v.type === type)
  );

  return (
    <div className="home">

      {/* HEADER */}
      <div className="hero">
        <h1>Browse All Vehicles 🚗</h1>

        <div className="search-bar">
          <input
            placeholder="Search by location..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FILTER */}
      <div className="filters">
        {["ALL", "CAR", "BIKE", "EV"].map(c => (
          <button
            key={c}
            className={type === c ? "active" : ""}
            onClick={() => setType(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.map(v => (
          <div className="card" key={v.id}>

            <img src={v.imageUrl} alt={v.name} />

            <div className="card-body">
              <h3>{v.name}</h3>

              <p>📍 {v.location}</p>

              <span className="type">{v.type}</span>

              <div className="bottom">
                <span>₹{v.pricePerDay}/day</span>
                <button>Book Now</button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Vehicles;