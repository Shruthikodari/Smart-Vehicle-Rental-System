import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees } from "../services/format";
import AdminLayout from "../components/AdminLayout";

// Customer accounts: booking activity and block / unblock
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/users")
      .then(res => setUsers(res.data))
      .catch(err => setError(errorMessage(err, "Could not load customers")))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (u) => {
    const question = u.active
      ? `Block ${u.name}? They will be logged out and won't be able to log in or book.`
      : `Unblock ${u.name}?`;
    if (!confirm(question)) return;
    try {
      const res = await API.put(`/admin/users/${u.id}/toggle`);
      setUsers(users.map(x => x.id === u.id ? { ...x, active: res.data.active } : x));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const q = search.trim().toLowerCase();
  const visible = users.filter(u => !q || [u.name, u.email, u.phone].some(f => f?.toLowerCase().includes(q)));
  const blocked = users.filter(u => !u.active).length;

  return (
    <AdminLayout title="Users" subtitle="Customer accounts and their booking activity.">
      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><p className="stat-label">Customers</p><h2 className="stat-value">{users.length}</h2></div>
        <div className="stat-card"><p className="stat-label">With an active booking</p><h2 className="stat-value">{users.filter(u => u.activeBookings > 0).length}</h2></div>
        <div className="stat-card"><p className="stat-label">Blocked</p><h2 className="stat-value">{blocked}</h2></div>
      </div>

      <section className="admin-section">
        <div className="section-header">
          <input className="table-search" type="text" placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="muted-text">{visible.length} customer{visible.length === 1 ? "" : "s"}</span>
        </div>
        {loading ? <p>Loading...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Bookings</th>
                <th>Total spent</th>
                <th>Last booking</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <tr key={u.id}>
                  <td>{u.name}<small className="cell-sub">{u.email}</small></td>
                  <td>{u.phone}</td>
                  <td className="nowrap">{formatDate(u.joined)}</td>
                  <td>{u.bookings}{u.activeBookings > 0 && <small className="cell-sub">{u.activeBookings} open</small>}</td>
                  <td className="nowrap">{rupees(u.totalSpent)}</td>
                  <td className="nowrap">{u.lastBooking ? formatDate(u.lastBooking) : "—"}</td>
                  <td><span className={`status-badge ${u.active ? "active" : "blocked"}`}>{u.active ? "Active" : "Blocked"}</span></td>
                  <td>
                    <button className={`btn-small ${u.active ? "block" : "unblock"}`} onClick={() => toggle(u)}>
                      {u.active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan="8" className="empty-cell">No customers found.</td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminUsers;
