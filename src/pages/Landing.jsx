import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <h1>🚗 SmartRide</h1>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate("/home")} className="nav-btn">Get Started</button>
          <button onClick={() => navigate("/admin-login")} className="nav-btn admin-btn">🔧 Admin</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>🏁 Your Smart Vehicle Rental Solution</h1>
          <p>Browse, Book, and Drive in Minutes. Everything you need for hassle-free mobility.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/home")}>
              🚙 Browse Vehicles & Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose SmartRide?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Quick</h3>
            <p>Book any vehicle in under 90 seconds with our streamlined checkout</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Unbeatable Prices</h3>
            <p>Competitive rates with zero hidden charges or surprise fees</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>100% Safe & Secure</h3>
            <p>Verified drivers and well-maintained premium vehicles</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3>Exclusive Offers</h3>
            <p>Special discounts and loyalty rewards for regular customers</p>
          </div>
        </div>
      </section>

      {/* Portal Selection */}
      <section className="portals">
        <h2>Choose Your Portal</h2>
        <div className="portal-grid">
          {/* User Portal */}
          <div className="portal-card user-portal">
            <div className="portal-icon">👤</div>
            <h3>User Portal</h3>
            <ul className="portal-features">
              <li>Browse 28+ premium vehicles</li>
              <li>3-step easy booking process</li>
              <li>Multiple payment options</li>
              <li>Real-time booking tracking</li>
              <li>Push notifications & alerts</li>
              <li>Rate & review drivers</li>
            </ul>
            <button className="portal-btn user-btn" onClick={() => navigate("/home")}>
              🚀 Start Booking Now
            </button>
          </div>

          {/* Admin Portal */}
          <div className="portal-card admin-portal">
            <div className="portal-icon">🔧</div>
            <h3>Admin Portal</h3>
            <ul className="portal-features">
              <li>Complete vehicle fleet management</li>
              <li>Driver performance tracking</li>
              <li>Booking approval & control</li>
              <li>Live revenue analytics</li>
              <li>Advanced performance metrics</li>
              <li>Business intelligence insights</li>
            </ul>
            <button className="portal-btn admin-btn" onClick={() => navigate("/admin-login")}>
              ⚙️ Go to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat">
          <h3>1,248+</h3>
          <p>🚗 Successful Bookings</p>
        </div>
        <div className="stat">
          <h3>₹52.4L</h3>
          <p>💵 Total Revenue</p>
        </div>
        <div className="stat">
          <h3>45+</h3>
          <p>👨‍💼 Active Drivers</p>
        </div>
        <div className="stat">
          <h3>28</h3>
          <p>🚙 Available Vehicles</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 SmartRide - Your Smart Vehicle Rental Solution</p>
        <p>✨ Seamless Mobility. Premium Experience. Always Available.</p>
      </footer>
    </div>
  );
};

export default Landing;