import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import NotificationList from "../components/NotificationList";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/mybookings.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/notifications")
      .then(res => setItems(res.data))
      .catch(err => setError(errorMessage(err, "Could not load notifications")));
  }, []);

  const unread = items.filter(n => !n.read).length;

  const open = async (n) => {
    if (!n.read) {
      await API.put(`/notifications/${n.id}/read`).catch(() => {});
      setItems(items.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.bookingCode) navigate(`/history/${n.bookingCode}`);
  };

  const markAll = async () => {
    await API.put("/notifications/read-all").catch(() => {});
    setItems(items.map(x => ({ ...x, read: true })));
  };

  return (
    <div>
      <SiteHeader />
      <div className="container page notifications-page">
        <div className="mybookings-header">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
          </div>
          {unread > 0 && <button className="btn-secondary" onClick={markAll}>Mark all as read</button>}
        </div>
        {error && <div className="form-error">{error}</div>}
        <NotificationList items={items} onOpen={open} />
      </div>
      <SiteFooter />
    </div>
  );
};

export default Notifications;
