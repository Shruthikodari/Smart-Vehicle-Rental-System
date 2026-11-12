import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees } from "../services/format";
import DriverLayout from "../components/DriverLayout";

const monthLabel = (iso) => new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// Driver fees from completed trips, by month, plus the full trip history
const DriverEarnings = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/driver/bookings")
      .then(res => setTrips(res.data))
      .catch(err => setError(errorMessage(err, "Could not load earnings")));
  }, []);

  const completed = trips.filter(t => t.status === "COMPLETED");
  const upcoming = trips.filter(t => t.status === "APPROVED" || t.status === "ONGOING");
  const total = completed.reduce((s, t) => s + t.driverCost, 0);
  const days = completed.reduce((s, t) => s + t.days, 0);

  const byMonth = [];
  completed.forEach(t => {
    const key = t.returnDate.slice(0, 7);
    let row = byMonth.find(r => r.key === key);
    if (!row) {
      row = { key, label: monthLabel(t.returnDate), trips: 0, days: 0, amount: 0 };
      byMonth.push(row);
    }
    row.trips += 1;
    row.days += t.days;
    row.amount += t.driverCost;
  });
  byMonth.sort((a, b) => b.key.localeCompare(a.key));

  return (
    <DriverLayout title="Earnings" subtitle="You earn ₹500 per day for every completed with-driver booking.">
      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><p className="stat-label">Total earned</p><h2 className="stat-value">{rupees(total)}</h2></div>
        <div className="stat-card"><p className="stat-label">Completed trips</p><h2 className="stat-value">{completed.length}</h2></div>
        <div className="stat-card"><p className="stat-label">Days driven</p><h2 className="stat-value">{days}</h2></div>
        <div className="stat-card"><p className="stat-label">Expected from upcoming trips</p><h2 className="stat-value">{rupees(upcoming.reduce((s, t) => s + t.driverCost, 0))}</h2></div>
      </div>

      <section className="admin-section">
        <h2>By month</h2>
        {byMonth.length === 0 ? <p className="muted-text">No completed trips yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Month</th><th>Trips</th><th>Days</th><th>Earned</th></tr></thead>
            <tbody>
              {byMonth.map(r => <tr key={r.key}><td>{r.label}</td><td>{r.trips}</td><td>{r.days}</td><td>{rupees(r.amount)}</td></tr>)}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h2>Trip history</h2>
        {completed.length === 0 ? <p className="muted-text">No completed trips yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Vehicle</th><th>Customer</th><th>Days</th><th>Earned</th><th></th></tr></thead>
            <tbody>
              {completed.map(t => (
                <tr key={t.id}>
                  <td className="nowrap">{formatDate(t.pickupDate)}</td>
                  <td>{t.vehicleName}</td>
                  <td>{t.customerName}</td>
                  <td>{t.days}</td>
                  <td>{rupees(t.driverCost)}</td>
                  <td><button className="btn-small" onClick={() => navigate(`/driver/trips/${t.id}`)}>Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DriverLayout>
  );
};

export default DriverEarnings;
