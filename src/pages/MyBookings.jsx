import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/mybookings.css";

const MyBookings = () => {
  const navigate = useNavigate();
  
  // Mock data - In production, fetch from backend
  const [bookings] = useState([
    {
      id: "BK-25876682",
      vehicleName: "Mahindra Thar",
      location: "Airport Terminal 2",
      pickupDate: "2026-04-17",
      returnDate: "2026-04-18",
      status: "COMPLETED",
      totalPaid: 7350,
      driverType: "With driver",
      paymentMethod: "CASH"
    },
    {
      id: "BK-18923456",
      vehicleName: "Honda City",
      location: "Downtown Station",
      pickupDate: "2026-04-20",
      returnDate: "2026-04-22",
      status: "UPCOMING",
      totalPaid: 4500,
      driverType: "Self drive",
      paymentMethod: "UPI"
    },
    {
      id: "BK-34567890",
      vehicleName: "Maruti Swift",
      location: "Mall Road",
      pickupDate: "2026-04-10",
      returnDate: "2026-04-12",
      status: "COMPLETED",
      totalPaid: 2800,
      driverType: "Self drive",
      paymentMethod: "Card"
    },
    {
      id: "BK-45678901",
      vehicleName: "BMW X5",
      location: "Airport Terminal 1",
      pickupDate: "2026-05-01",
      returnDate: "2026-05-03",
      status: "UPCOMING",
      totalPaid: 15000,
      driverType: "With driver",
      paymentMethod: "UPI"
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: "REMINDER",
      title: "Pickup Reminder",
      message: "Your Honda City pickup is scheduled for tomorrow at 10:00 AM",
      time: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "ALERT",
      title: "Price Drop Alert",
      message: "BMW X5 price reduced by 10% for your next booking!",
      time: "1 day ago",
      read: false
    },
    {
      id: 3,
      type: "INFO",
      title: "Booking Completed",
      message: "Your Mahindra Thar booking has been completed. Rate your experience.",
      time: "3 days ago",
      read: true
    },
    {
      id: 4,
      type: "OFFER",
      title: "Special Offer",
      message: "Get 20% off on your next booking with code SAVE20",
      time: "5 days ago",
      read: true
    }
  ]);

  const upcomingBookings = bookings.filter(b => b.status === "UPCOMING");
  const pastBookings = bookings.filter(b => b.status === "COMPLETED");
  const unreadNotifications = notifications.filter(n => !n.read);

  const getStatusColor = (status) => {
    return status === "UPCOMING" ? "#00dd00" : "#999";
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "REMINDER": return "🔔";
      case "ALERT": return "⚠️";
      case "OFFER": return "🎉";
      case "INFO": return "ℹ️";
      default: return "📢";
    }
  };

  return (
    <div className="mybookings-container">
      {/* Header */}
      <div className="mybookings-header">
        <h1>My Bookings & Alerts</h1>
        <p>Manage your bookings and stay updated</p>
      </div>

      {/* Notifications Section */}
      <section className="notifications-section">
        <div className="section-title">
          <h2>Alerts & Notifications</h2>
          {unreadNotifications.length > 0 && (
            <span className="badge">{unreadNotifications.length} new</span>
          )}
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="empty-state">No notifications</p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className={`notification-item ${notif.type.toLowerCase()} ${!notif.read ? "unread" : ""}`}>
                <div className="notif-icon">{getNotificationIcon(notif.type)}</div>
                <div className="notif-content">
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Upcoming Bookings */}
      <section className="bookings-section">
        <div className="section-title">
          <h2>Upcoming Bookings</h2>
          <span className="count">{upcomingBookings.length}</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming bookings</p>
            <button className="btn-new-booking" onClick={() => navigate("/home")}>
              Book a Vehicle
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.vehicleName}</h3>
                  <span className="status-badge upcoming">UPCOMING</span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Booking ID</span>
                    <span className="value">{booking.id}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Pickup Location</span>
                    <span className="value">{booking.location}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Dates</span>
                    <span className="value">
                      {booking.pickupDate} → {booking.returnDate}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Driver</span>
                    <span className="value">{booking.driverType}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Payment</span>
                    <span className="value">{booking.paymentMethod}</span>
                  </div>

                  <div className="detail-item highlight">
                    <span className="label">Total</span>
                    <span className="value">₹{booking.totalPaid}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="btn-secondary">Cancel Booking</button>
                  <button className="btn-primary">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Bookings */}
      <section className="bookings-section">
        <div className="section-title">
          <h2>Past Bookings</h2>
          <span className="count">{pastBookings.length}</span>
        </div>

        {pastBookings.length === 0 ? (
          <p className="empty-state">No past bookings</p>
        ) : (
          <div className="bookings-grid">
            {pastBookings.map(booking => (
              <div key={booking.id} className="booking-card past">
                <div className="booking-header">
                  <h3>{booking.vehicleName}</h3>
                  <span className="status-badge completed">COMPLETED</span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Booking ID</span>
                    <span className="value">{booking.id}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Pickup Location</span>
                    <span className="value">{booking.location}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Dates</span>
                    <span className="value">
                      {booking.pickupDate} → {booking.returnDate}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Driver</span>
                    <span className="value">{booking.driverType}</span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Payment</span>
                    <span className="value">{booking.paymentMethod}</span>
                  </div>

                  <div className="detail-item highlight">
                    <span className="label">Total Paid</span>
                    <span className="value">₹{booking.totalPaid}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button className="btn-secondary">Download Receipt</button>
                  <button className="btn-primary">Rate & Review</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Back Button */}
      <div className="back-button">
        <button onClick={() => navigate("/home")}>← Back to Home</button>
      </div>
    </div>
  );
};

export default MyBookings;
