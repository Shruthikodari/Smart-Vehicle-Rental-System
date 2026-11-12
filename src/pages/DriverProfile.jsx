import { useEffect, useState } from "react";
import API, { errorMessage } from "../services/api";
import { DetailsForm, PasswordForm } from "../components/ProfileForms";
import DriverLayout from "../components/DriverLayout";
import "../styles/mybookings.css";

const DriverProfile = () => {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/driver/me")
      .then(res => setMe(res.data))
      .catch(err => setError(errorMessage(err, "Could not load your profile")));
  }, []);

  const saved = (driver) => {
    setMe({ ...me, driver });
    // Keep the name in the sidebar up to date
    try {
      const user = JSON.parse(localStorage.getItem("driverUser")) || {};
      localStorage.setItem("driverUser", JSON.stringify({ ...user, name: driver.name, phone: driver.phone }));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <DriverLayout title="Profile" subtitle="Customers see your name and phone number on their booking.">
      {error && <div className="form-error">{error}</div>}
      {me && (
        <div className="two-col">
          <section className="admin-section">
            <h2>Your details</h2>
            <DetailsForm url="/driver/profile" initial={me.driver} withLicense onSaved={saved} />
          </section>
          <div>
            <section className="admin-section">
              <h2>Your record</h2>
              <dl className="detail-list">
                <dt>Rating</dt><dd><span className="stars-gold">★</span> {me.driver.rating} / 5</dd>
                <dt>Completed trips</dt><dd>{me.driver.trips}</dd>
                <dt>Account status</dt><dd>{me.driver.status === "ACTIVE" ? "Active" : me.driver.status}</dd>
              </dl>
            </section>
            <section className="admin-section">
              <h2>Change password</h2>
              <PasswordForm url="/driver/password" />
            </section>
          </div>
        </div>
      )}
    </DriverLayout>
  );
};

export default DriverProfile;
