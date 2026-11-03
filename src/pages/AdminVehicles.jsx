import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import "../styles/admin.css";

const EMPTY_FORM = {
  name: "", brand: "", type: "CAR", pricePerDay: "", mileage: "", fuelType: "Petrol",
  transmission: "Manual", seatingCapacity: "5", location: "", imageUrl: "", rating: "4.5", status: "AVAILABLE",
};

const AdminVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };

  useEffect(() => {
    API.get("/admin/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => setError(errorMessage(err, "Could not load vehicles")));
  }, []);

  const field = (name) => ({
    value: formData[name],
    onChange: (e) => setFormData({ ...formData, [name]: e.target.value }),
  });

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setFormData({ ...EMPTY_FORM, ...Object.fromEntries(Object.entries(vehicle).map(([k, v]) => [k, v ?? ""])) });
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.pricePerDay || !formData.mileage || !formData.location.trim()) {
      setFormError("Name, price, mileage and location are required");
      return;
    }
    const payload = {
      ...formData,
      pricePerDay: Number(formData.pricePerDay),
      mileage: Number(formData.mileage),
      seatingCapacity: Number(formData.seatingCapacity),
      rating: Number(formData.rating),
    };
    try {
      if (editingId) {
        const res = await API.put(`/admin/vehicles/${editingId}`, payload);
        setVehicles(vehicles.map(v => v.id === editingId ? res.data : v));
      } else {
        const res = await API.post("/admin/vehicles", payload);
        setVehicles([...vehicles, res.data]);
      }
      setShowForm(false);
    } catch (err) {
      setFormError(errorMessage(err, "Could not save vehicle"));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.patch(`/admin/vehicles/${id}/status`, { status: newStatus });
      setVehicles(vehicles.map(v => v.id === id ? res.data : v));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await API.delete(`/admin/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err) {
      alert(errorMessage(err, "Could not delete vehicle"));
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h1>Vehicle Management</h1>
        <div className="admin-nav">
          <button onClick={() => navigate("/admin")}>📊 Dashboard</button>
          <button className="active">🚗 Vehicles</button>
          <button onClick={() => navigate("/admin/drivers")}>👥 Drivers</button>
          <button onClick={() => navigate("/admin/bookings")}>📅 Bookings</button>
          <button onClick={() => navigate("/admin/analytics")}>📈 Analytics</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {error && <p style={{color: '#ff6b6b'}}>{error}</p>}

      {/* Add Vehicle Button */}
      <button className="btn-add" onClick={() => showForm ? setShowForm(false) : openAdd()}>+ Add New Vehicle</button>

      {/* Add / Edit Vehicle Form */}
      {showForm && (
        <div className="admin-form">
          <h3>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h3>
          {formError && <p style={{color: '#ff6b6b'}}>{formError}</p>}
          <div className="form-grid">
            <input type="text" placeholder="Vehicle Name" {...field("name")} />
            <input type="text" placeholder="Brand" {...field("brand")} />
            <select {...field("type")}>
              <option value="CAR">Car</option>
              <option value="SUV">SUV</option>
              <option value="BIKE">Bike</option>
              <option value="LUXURY">Luxury</option>
              <option value="EV">Electric</option>
            </select>
            <input type="number" placeholder="Price/Day (₹)" {...field("pricePerDay")} />
            <input type="number" placeholder={formData.type === "EV" ? "Range (km)" : "Mileage (kmpl)"} {...field("mileage")} />
            <select {...field("fuelType")}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>Electric</option>
              <option>CNG</option>
            </select>
            <select {...field("transmission")}>
              <option>Manual</option>
              <option>Automatic</option>
            </select>
            <input type="number" placeholder="Seats" {...field("seatingCapacity")} />
            <input type="text" placeholder="Pickup Location" {...field("location")} />
            <input type="number" step="0.1" min="0" max="5" placeholder="Rating" {...field("rating")} />
            <input type="text" placeholder="Image URL" {...field("imageUrl")} />
            <button className="btn-submit" onClick={handleSave}>{editingId ? "Save Changes" : "Add Vehicle"}</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      <section className="admin-section">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Price/Day</th>
              <th>Mileage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.location}</td>
                <td>₹{vehicle.pricePerDay}</td>
                <td>{vehicle.mileage} {vehicle.type === "EV" ? "km" : "kmpl"}</td>
                <td>
                  <select
                    value={vehicle.status}
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                    className={`status-select ${vehicle.status.toLowerCase()}`}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </td>
                <td>
                  <button className="btn-small edit" onClick={() => openEdit(vehicle)}>Edit</button>
                  <button className="btn-small delete" onClick={() => handleDeleteVehicle(vehicle.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminVehicles;
