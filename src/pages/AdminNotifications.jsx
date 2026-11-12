import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import NotificationList from "../components/NotificationList";
import AdminLayout from "../components/AdminLayout";

// New booking requests, driver registrations and trip updates for the admin team
const AdminNotifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/notifications")
      .then(res => setItems(res.data))
      .catch(err => setError(errorMessage(err, "Could not load notifications")));
  }, []);

  const unread = items.filter(n => !n.read).length;

  const open = async (n) => {
    if (!n.read) {
      await API.put(`/admin/notifications/${n.id}/read`).catch(() => {});
      setItems(items.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.title === "New driver registration") navigate("/admin/drivers");
    else if (n.bookingCode) navigate("/admin/bookings");
  };

  const markAll = async () => {
    await API.put("/admin/notifications/read-all").catch(() => {});
    setItems(items.map(x => ({ ...x, read: true })));
  };

  return (
    <AdminLayout
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : "You're all caught up."}
      actions={unread > 0 && <button className="btn-small" onClick={markAll}>Mark all as read</button>}
    >
      {error && <div className="form-error">{error}</div>}
      <NotificationList items={items} onOpen={open} />
    </AdminLayout>
  );
};

export default AdminNotifications;
