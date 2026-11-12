import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import { titleCase } from "../services/format";
import AdminLayout from "../components/AdminLayout";

const EMPTY_FORM = { name: "", phone: "", email: "", licenseNumber: "", password: "" };

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/drivers")
      .then(res => setDrivers(res.data))
      .catch(err => setError(errorMessage(err, "Could not load drivers")));
  }, []);

  const replace = (updated) => setDrivers(drivers.map(d => d.id === updated.id ? updated : d));

  const act = async (driver, action, question) => {
    if (question && !confirm(question)) return;
    try {
      const res = await API.put(`/admin/drivers/${driver.id}/${action}`);
      replace(res.data);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleAddDriver = async () => {
    if (!formData.name.trim() || !/^\d{10}$/.test(formData.phone)) {
      setFormError("Name and a 10-digit phone number are required");
      return;
    }
    if (!formData.email.includes("@") || formData.password.length < 6) {
      setFormError("Email and a password of at least 6 characters are needed for the driver's login");
      return;
    }
    try {
      const res = await API.post("/admin/drivers", formData);
      setDrivers([...drivers, res.data]);
      setFormData(EMPTY_FORM);
      setFormError("");
      setShowForm(false);
    } catch (err) {
      setFormError(errorMessage(err, "Could not add driver"));
    }
  };

  const field = (name, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={formData[name]}
      maxLength={name === "phone" ? 10 : undefined}
      onChange={(e) => setFormData({ ...formData, [name]: name === "phone" ? e.target.value.replace(/\D/g, "") : e.target.value })}
    />
  );

  const pending = drivers.filter(d => d.status === "PENDING");
  const team = drivers.filter(d => d.status !== "PENDING");

  return (
    <AdminLayout
      title="Drivers"
      subtitle="Approved drivers are assigned automatically to with-driver bookings, highest rated first."
      actions={<button className="btn-add" onClick={() => setShowForm(!showForm)}>Add driver</button>}
    >
      {error && <div className="form-error">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h3>New driver</h3>
          <p className="muted-text">The driver can log in at /driver/login with this email and password.</p>
          {formError && <div className="form-error">{formError}</div>}
          <div className="form-grid">
            {field("name", "Full name")}
            {field("phone", "Mobile (10 digits)", "tel")}
            {field("email", "Email (login)", "email")}
            {field("licenseNumber", "Driving licence no.")}
            {field("password", "Password (min 6 characters)", "password")}
            <button className="btn-submit" onClick={handleAddDriver}>Add driver</button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <section className="admin-section highlight-section">
          <h2>Waiting for approval ({pending.length})</h2>
          <p className="muted-text">These drivers registered themselves. Check their licence before approving.</p>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Licence</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pending.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.phone}</td>
                  <td>{d.email}</td>
                  <td>{d.licenseNumber || "—"}</td>
                  <td className="nowrap">
                    <button className="btn-small approve" onClick={() => act(d, "approve", `Approve ${d.name} as a driver?`)}>Approve</button>
                    <button className="btn-small reject" onClick={() => act(d, "reject", `Reject ${d.name}'s registration?`)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="admin-section">
        <h2>All drivers</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Licence</th>
              <th>Rating</th>
              <th>Trips</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map(driver => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.phone}</td>
                <td>{driver.email}</td>
                <td>{driver.licenseNumber}</td>
                <td><span className="stars-gold">★</span> {driver.rating}</td>
                <td>{driver.trips}</td>
                <td><span className={`status-badge ${driver.status.toLowerCase()}`}>{titleCase(driver.status)}</span></td>
                <td>
                  <button
                    className={`btn-small ${driver.status === "ACTIVE" ? "block" : "unblock"}`}
                    onClick={() => act(driver, "toggle", driver.status === "ACTIVE"
                      ? `Block ${driver.name}? They won't be able to log in or get new trips.` : null)}
                  >
                    {driver.status === "ACTIVE" ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
};

export default AdminDrivers;
