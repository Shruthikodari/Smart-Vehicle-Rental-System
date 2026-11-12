import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import { rupees, todayIso } from "../services/format";
import AdminLayout from "../components/AdminLayout";

const monthStart = () => todayIso().slice(0, 8) + "01";
const monthsAgo = (n) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n, 1);
  return d.toISOString().slice(0, 10);
};

// Groups bookings by a key and sums counts / amounts
const groupBy = (list, keyFn, valueFn) => {
  const map = new Map();
  list.forEach(b => {
    const key = keyFn(b);
    const row = map.get(key) || { key, bookings: 0, days: 0, amount: 0 };
    row.bookings += 1;
    row.days += b.days;
    row.amount += valueFn(b);
    map.set(key, row);
  });
  return [...map.values()].sort((a, b) => b.amount - a.amount);
};

const paid = (b) => (b.paymentStatus === "PAID" ? b.total : 0);

// Downloadable booking report for any date range (by pick-up date)
const AdminReports = () => {
  const [bookings, setBookings] = useState([]);
  const [from, setFrom] = useState(monthsAgo(2));
  const [to, setTo] = useState(todayIso());
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/bookings")
      .then(res => setBookings(res.data))
      .catch(err => setError(errorMessage(err, "Could not load bookings")));
  }, []);

  const inRange = bookings.filter(b => b.pickupDate >= from && b.pickupDate <= to);
  const closed = inRange.filter(b => b.status === "CANCELLED" || b.status === "REJECTED");
  const revenue = inRange.reduce((s, b) => s + paid(b), 0);
  const refunded = inRange.filter(b => b.paymentStatus === "REFUNDED").reduce((s, b) => s + b.total, 0);
  const cashDue = inRange.filter(b => b.paymentStatus === "PENDING" && !closed.includes(b)).reduce((s, b) => s + b.total, 0);

  const byVehicle = groupBy(inRange, b => b.vehicleName, paid);
  const byDriver = groupBy(inRange.filter(b => b.driverName && b.status === "COMPLETED"), b => b.driverName, b => b.driverCost);
  const byMethod = groupBy(inRange, b => b.paymentMethod, paid);

  const downloadCsv = () => {
    const header = ["Booking ID", "Customer", "Phone", "Vehicle", "Pick-up", "Return", "Days", "Driver", "Status", "Payment", "Payment status", "Total"];
    const rows = inRange.map(b => [b.bookingCode, b.customerName, b.customerPhone, b.vehicleName, b.pickupDate, b.returnDate,
      b.days, b.driverName || "Self-drive", b.status, b.paymentMethod, b.paymentStatus, b.total]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartride-bookings-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const table = (title, rows, firstCol, amountLabel) => (
    <section className="admin-section">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="muted-text">No data for this period.</p> : (
        <table className="admin-table">
          <thead><tr><th>{firstCol}</th><th>Bookings</th><th>Rental days</th><th>{amountLabel}</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key}><td>{r.key}</td><td>{r.bookings}</td><td>{r.days}</td><td>{rupees(r.amount)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <AdminLayout
      title="Reports"
      subtitle="Bookings by pick-up date. Download the list as CSV to open it in Excel."
      actions={<button className="btn-add" onClick={downloadCsv} disabled={inRange.length === 0}>Download CSV</button>}
    >
      {error && <div className="form-error">{error}</div>}

      <section className="admin-section report-filters">
        <div>
          <label>From</label>
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label>To</label>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="quick-ranges">
          <button className="btn-small" onClick={() => { setFrom(monthStart()); setTo(todayIso()); }}>This month</button>
          <button className="btn-small" onClick={() => { setFrom(monthsAgo(1)); setTo(monthStart()); }}>Last month</button>
          <button className="btn-small" onClick={() => { setFrom(monthsAgo(6)); setTo(todayIso()); }}>Last 6 months</button>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card"><p className="stat-label">Bookings</p><h2 className="stat-value">{inRange.length}</h2></div>
        <div className="stat-card"><p className="stat-label">Completed</p><h2 className="stat-value">{inRange.filter(b => b.status === "COMPLETED").length}</h2></div>
        <div className="stat-card"><p className="stat-label">Cancelled / rejected</p><h2 className="stat-value">{closed.length}</h2></div>
        <div className="stat-card"><p className="stat-label">Revenue collected</p><h2 className="stat-value">{rupees(revenue)}</h2></div>
        <div className="stat-card"><p className="stat-label">Refunded</p><h2 className="stat-value">{rupees(refunded)}</h2></div>
        <div className="stat-card"><p className="stat-label">Cash still to collect</p><h2 className="stat-value">{rupees(cashDue)}</h2></div>
      </div>

      {table("By vehicle", byVehicle, "Vehicle", "Revenue collected")}
      {table("Driver payouts (completed trips)", byDriver, "Driver", "Driver charges")}
      {table("By payment method", byMethod, "Method", "Revenue collected")}
    </AdminLayout>
  );
};

export default AdminReports;
