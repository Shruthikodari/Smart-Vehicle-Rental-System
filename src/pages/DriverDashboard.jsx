import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../services/api";
import { formatDate, rupees, titleCase } from "../services/format";
import DriverLayout from "../components/DriverLayout";
import TripActions from "../components/TripActions";
import NotificationList from "../components/NotificationList";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([API.get("/driver/me"), API.get("/driver/notifications")])
      .then(([me, n]) => {
        setData(me.data);
        setNotifications(n.data);
      })
      .catch(err => setError(errorMessage(err, "Could not load your dashboard")));

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await API.put("/driver/notifications/read-all").catch(() => {});
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  if (error) return <DriverLayout title="Dashboard"><div className="form-error">{error}</div></DriverLayout>;
  if (!data) return <DriverLayout title="Dashboard"><p>Loading...</p></DriverLayout>;

  const unread = notifications.filter(n => !n.read).length;

  return (
    <DriverLayout title={`Hello, ${data.driver.name.split(" ")[0]}`} subtitle="Your trips for today and what's coming up.">
      <div className="stats-grid">
        <div className="stat-card"><p className="stat-label">Upcoming trips</p><h2 className="stat-value">{data.upcoming}</h2></div>
        <div className="stat-card"><p className="stat-label">On a trip now</p><h2 className="stat-value">{data.ongoing}</h2></div>
        <div className="stat-card"><p className="stat-label">Completed trips</p><h2 className="stat-value">{data.completed}</h2></div>
        <div className="stat-card"><p className="stat-label">Total earnings</p><h2 className="stat-value">{rupees(data.earnings)}</h2></div>
        <div className="stat-card"><p className="stat-label">Your rating</p><h2 className="stat-value"><span className="stars-gold">★</span> {data.driver.rating}</h2></div>
      </div>

      <section className="admin-section">
        <div className="section-header">
          <h2>Today</h2>
          <button className="btn-view-all" onClick={() => navigate("/driver/bookings")}>All assigned trips</button>
        </div>
        {data.today.length === 0 ? (
          <p className="muted-text">No trips today.{data.upcoming > 0 ? " Check Assigned trips for upcoming ones." : ""}</p>
        ) : data.today.map(t => (
          <div key={t.id} className="trip-card">
            <div>
              <h3>{t.vehicleName} · <span className={`status-badge ${t.status.toLowerCase()}`}>{titleCase(t.status)}</span></h3>
              <p>{t.customerName} ({t.customerPhone}) · {t.pickupLocation}</p>
              <p className="muted-text">{formatDate(t.pickupDate)} – {formatDate(t.returnDate)} · {t.bookingCode}</p>
            </div>
            <div className="trip-actions">
              <TripActions trip={t} onChange={load} />
              <button className="btn-small" onClick={() => navigate(`/driver/trips/${t.id}`)}>Details</button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>Notifications</h2>
          {unread > 0 && <button className="btn-small" onClick={markAll}>Mark all as read</button>}
        </div>
        <NotificationList
          items={notifications.slice(0, 8)}
          onOpen={(n) => { if (n.bookingCode) navigate("/driver/bookings"); }}
        />
      </section>
    </DriverLayout>
  );
};

export default DriverDashboard;
