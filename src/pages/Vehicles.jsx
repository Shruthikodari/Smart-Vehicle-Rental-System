import { useEffect, useState } from "react";
import "../styles/home.css"; // reuse same css
import { vehicleImage, handleImageError } from "../services/images";
import API from "../services/api";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    API.get("/vehicles")
      .then((res) => {
        console.log("ALL VEHICLES:", res.data);
        setVehicles(res.data);
      })
      .catch((err) => console.error("Failed fetching vehicles:", err));
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

            <img src={vehicleImage(v.imageUrl)} onError={handleImageError} alt={v.name} />

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