import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

const AdminVehicles = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin-login", { replace: true });
  };
  const [vehicles, setVehicles] = useState([
    { id: 1, name: "Honda City", type: "CAR", status: "AVAILABLE", pricePerDay: 1200, mileage: 18 },
    { id: 2, name: "Mahindra Thar", type: "SUV", status: "BOOKED", pricePerDay: 3000, mileage: 15 },
    { id: 3, name: "Maruti Swift", type: "CAR", status: "AVAILABLE", pricePerDay: 1400, mileage: 20 },
    { id: 4, name: "BMW X5", type: "LUXURY", status: "MAINTENANCE", pricePerDay: 5000, mileage: 12 }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "CAR", status: "AVAILABLE", pricePerDay: "", mileage: "" });

  const handleAddVehicle = () => {
    if (formData.name && formData.pricePerDay && formData.mileage) {
      setVehicles([...vehicles, { id: vehicles.length + 1, ...formData, pricePerDay: parseInt(formData.pricePerDay), mileage: parseInt(formData.mileage) }]);
      setFormData({ name: "", type: "CAR", status: "AVAILABLE", pricePerDay: "", mileage: "" });
      setShowForm(false);
      alert("Vehicle added successfully!");
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  const handleDeleteVehicle = (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
      alert("Vehicle deleted successfully!");
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

      {/* Add Vehicle Button */}
      <button className="btn-add" onClick={() => setShowForm(!showForm)}>+ Add New Vehicle</button>

      {/* Add Vehicle Form */}
      {showForm && (
        <div className="admin-form">
          <h3>Add New Vehicle</h3>
          <div className="form-grid">
            <input type="text" placeholder="Vehicle Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="CAR">Car</option>
              <option value="SUV">SUV</option>
              <option value="BIKE">Bike</option>
              <option value="LUXURY">Luxury</option>
              <option value="EV">Electric</option>
            </select>
            <input type="number" placeholder="Price/Day" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} />
            <input type="number" placeholder="Mileage (kmpl)" value={formData.mileage} onChange={(e) => setFormData({...formData, mileage: e.target.value})} />
            <button className="btn-submit" onClick={handleAddVehicle}>Add Vehicle</button>
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
                <td>₹{vehicle.pricePerDay}</td>
                <td>{vehicle.mileage} kmpl</td>
                <td>
                  <select 
                    value={vehicle.status} 
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                    className={`status-select ${vehicle.status.toLowerCase()}`}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </td>
                <td>
                  <button className="btn-small edit">Edit</button>
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
