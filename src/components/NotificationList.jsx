import { timeAgo } from "../services/format";
import "../styles/mybookings.css";

const NOTIF_CLASS = { INFO: "info", SUCCESS: "success", WARNING: "warning", REMINDER: "reminder" };

// Notifications list used by customers, admins and drivers; clicking an item calls onOpen
const NotificationList = ({ items, onOpen }) => (
  <div className="notifications-list">
    {items.length === 0 ? (
      <p className="empty-state">No notifications yet</p>
    ) : (
      items.map(n => (
        <div
          key={n.id}
          className={`notification-item ${NOTIF_CLASS[n.type] || "info"} ${!n.read ? "unread" : ""}`}
          onClick={() => onOpen && onOpen(n)}
          style={{ cursor: onOpen ? "pointer" : "default" }}
        >
          <span className="notif-dot" />
          <div className="notif-content">
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <span className="notif-time">{timeAgo(n.createdAt)}</span>
          </div>
        </div>
      ))
    )}
  </div>
);

export default NotificationList;
