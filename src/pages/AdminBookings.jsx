import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import AdminLayout from "../components/AdminLayout";

const ACTIVE = ["PENDING", "APPROVED", "ONGOING"];
const TABS = [
  { value: "ACTION", label: "Needs action", match: b => ACTIVE.includes(b.status) },
  { value: "PENDING", label: "Waiting for approval", match: b => b.status === "PENDING" },
  { value: "APPROVED", label: "Approved", match: b => b.status === "APPROVED" },
  { value: "ONGOING", label: "Out on rent", match: b => b.status === "ONGOING" },
  { value: "COMPLETED", label: "Completed", match: b => b.status === "COMPLETED" },
  { value: "CLOSED", label: "Cancelled / rejected", match: b => b.status === "CANCELLED" || b.status === "REJECTED" },
  { value: "ALL", label: "All", match: () => true },
];
const PAGE_SIZE = 20;

const today = () => new Date().toISOString().slice(0, 10);
const shortDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const label = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("ACTION");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/bookings")
      .then(res => setBookings(res.data))
      .catch(err => setError(errorMessage(err, "Could not load bookings")))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (booking, status, message) => {
    let note = null;
    if (status === "REJECTED" || status === "CANCELLED") {
      // Reason is shown to the customer in their notification
      note = prompt(`${message} booking ${booking.bookingCode}? Enter a reason for the customer (optional):`, "");
      if (note === null) return;
    } else if (!confirm(`${message} booking ${booking.bookingCode}?`)) {
      return;
    }
    try {
      const res = await API.put(`/admin/bookings/${booking.id}/status`, { status, note });
      setBookings(bookings.map(b => b.id === booking.id ? res.data : b));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const selectTab = (value) => {
    setTab(value);
    setShown(PAGE_SIZE);
  };

  const query = search.trim().toLowerCase();
  const current = TABS.find(t => t.value === tab);
  const filtered = bookings
    .filter(current.match)
    .filter(b => !query || [b.bookingCode, b.customerName, b.customerPhone, b.vehicleName]
      .some(f => f?.toLowerCase().includes(query)));
  // Open bookings are listed by pickup date (soonest first); history is listed newest first
  const visible = (tab === "ACTION" || ACTIVE.includes(tab)
    ? [...filtered].sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))
    : filtered
  ).slice(0, shown);

  const count = (value) => bookings.filter(TABS.find(t => t.value === value).match).length;

  return (
    <AdminLayout title="Bookings" subtitle="Review new requests and move rentals through pickup and return.">
      {error && <div className="form-error">{error}</div>}

      <div className="tab-row">
        {TABS.map(t => (
          <button key={t.value} className={`tab ${tab === t.value ? "active" : ""}`} onClick={() => selectTab(t.value)}>
            {t.label} <span className="tab-count">{count(t.value)}</span>
          </button>
        ))}
      </div>

      <section className="admin-section">
        <div className="section-header">
          <input
            className="table-search"
            type="text"
            placeholder="Search by booking ID, customer, phone or vehicle"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShown(PAGE_SIZE); }}
          />
          <span className="muted-text">{filtered.length} booking{filtered.length === 1 ? "" : "s"}</span>
        </div>

        {loading ? <p>Loading bookings...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(booking => (
                <tr key={booking.id}>
                  <td className="nowrap">
                    {booking.bookingCode}
                    <small className="cell-sub">Booked {shortDate(booking.createdAt)}</small>
                  </td>
                  <td>
                    {booking.customerName}
                    <small className="cell-sub">{booking.customerPhone || booking.customerEmail}</small>
                  </td>
                  <td>
                    {booking.vehicleName}
                    <small className="cell-sub">{booking.driverName ? `Driver: ${booking.driverName}` : "Self-drive"}</small>
                  </td>
                  <td className="nowrap">
                    {shortDate(booking.pickupDate)} – {shortDate(booking.returnDate)}
                    <small className="cell-sub">{booking.days} day{booking.days === 1 ? "" : "s"}</small>
                  </td>
                  <td className="nowrap">
                    ₹{booking.total.toLocaleString("en-IN")}
                    <small className="cell-sub">{booking.paymentMethod} · {booking.paymentStatus.toLowerCase()}</small>
                  </td>
                  <td><span className={`status-badge ${booking.status.toLowerCase()}`}>{label(booking.status)}</span></td>
                  <td className="nowrap">
                    {booking.status === "PENDING" && (
                      <>
                        <button className="btn-small approve" onClick={() => updateStatus(booking, "APPROVED", "Approve")}>Approve</button>
                        <button className="btn-small reject" onClick={() => updateStatus(booking, "REJECTED", "Reject")}>Reject</button>
                      </>
                    )}
                    {booking.status === "APPROVED" && (
                      <>
                        {booking.pickupDate <= today() && (
                          <button className="btn-small start" onClick={() => updateStatus(booking, "ONGOING", "Start rental for")}>Start rental</button>
                        )}
                        <button className="btn-small reject" onClick={() => updateStatus(booking, "CANCELLED", "Cancel")}>Cancel</button>
                      </>
                    )}
                    {booking.status === "ONGOING" && (
                      <button className="btn-small approve" onClick={() => updateStatus(booking, "COMPLETED", "Mark as returned and complete")}>Mark returned</button>
                    )}
                    {["COMPLETED", "CANCELLED", "REJECTED"].includes(booking.status) && (
                      <span className="muted-text">{booking.adminNote || "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="7" className="empty-cell">Nothing here right now.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {filtered.length > shown && (
          <button className="btn-small show-more" onClick={() => setShown(shown + PAGE_SIZE)}>
            Show more ({filtered.length - shown} left)
          </button>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminBookings;
