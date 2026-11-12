import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees, titleCase } from "../services/format";
import DriverLayout from "../components/DriverLayout";
import TripActions from "../components/TripActions";

const TABS = [
  { value: "UPCOMING", label: "Upcoming", match: b => b.status === "APPROVED" },
  { value: "ONGOING", label: "On trip", match: b => b.status === "ONGOING" },
  { value: "PENDING", label: "Awaiting approval", match: b => b.status === "PENDING" },
  { value: "COMPLETED", label: "Completed", match: b => b.status === "COMPLETED" },
  { value: "ALL", label: "All", match: () => true },
];

// Every booking this driver is assigned to
const DriverBookings = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [tab, setTab] = useState("UPCOMING");
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/driver/bookings")
      .then(res => setTrips(res.data))
      .catch(err => setError(errorMessage(err, "Could not load your trips")));
  }, []);

  const update = (updated) => setTrips(trips.map(t => t.id === updated.id ? updated : t));
  const current = TABS.find(t => t.value === tab);
  const visible = trips.filter(current.match);
  const sorted = tab === "COMPLETED" || tab === "ALL" ? visible : [...visible].sort((a, b) => a.pickupDate.localeCompare(b.pickupDate));

  return (
    <DriverLayout title="Assigned trips" subtitle="Start the trip when you meet the customer, and end it when the vehicle is returned.">
      {error && <div className="form-error">{error}</div>}

      <div className="tab-row">
        {TABS.map(t => (
          <button key={t.value} className={`tab ${tab === t.value ? "active" : ""}`} onClick={() => setTab(t.value)}>
            {t.label} <span className="tab-count">{trips.filter(t.match).length}</span>
          </button>
        ))}
      </div>

      <section className="admin-section">
        <table className="admin-table">
          <thead>
            <tr><th>Trip</th><th>Customer</th><th>Pick-up</th><th>Dates</th><th>Your fee</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sorted.map(t => (
              <tr key={t.id}>
                <td className="nowrap">{t.vehicleName}<small className="cell-sub">{t.bookingCode}</small></td>
                <td>{t.customerName}<small className="cell-sub">{t.customerPhone}</small></td>
                <td>{t.pickupLocation}</td>
                <td className="nowrap">{formatDate(t.pickupDate, false)} – {formatDate(t.returnDate, false)}<small className="cell-sub">{t.days} day{t.days === 1 ? "" : "s"}</small></td>
                <td>{rupees(t.driverCost)}</td>
                <td><span className={`status-badge ${t.status.toLowerCase()}`}>{titleCase(t.status)}</span></td>
                <td className="nowrap">
                  <TripActions trip={t} onChange={update} />
                  <button className="btn-small" onClick={() => navigate(`/driver/trips/${t.id}`)}>Details</button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan="7" className="empty-cell">No trips here.</td></tr>}
          </tbody>
        </table>
      </section>
    </DriverLayout>
  );
};

export default DriverBookings;
