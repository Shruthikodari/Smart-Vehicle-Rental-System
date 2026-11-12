import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { formatDate, rupees } from "../services/format";
import { DetailsForm, PasswordForm } from "../components/ProfileForms";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import "../styles/mybookings.css";

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/me/profile").then(res => setProfile(res.data)).catch(() => {});
    API.get("/me/dashboard").then(res => setStats(res.data)).catch(() => {});
  }, []);

  const saved = (user) => {
    setProfile(user);
    updateUser(user);
  };

  return (
    <div>
      <SiteHeader />
      <div className="container page">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details. These are used for all your bookings.</p>

        {profile && (
          <div className="profile-grid">
            <div className="panel profile-panel">
              <h3>Personal details</h3>
              <DetailsForm url="/me/profile" initial={profile} onSaved={saved} />
            </div>
            <div className="profile-side">
              <div className="panel profile-panel">
                <h3>Account</h3>
                <div className="booking-details">
                  <div className="detail-item"><span className="label">Member since</span><span className="value">{formatDate(profile.createdAt)}</span></div>
                  {stats && (
                    <>
                      <div className="detail-item"><span className="label">Trips completed</span><span className="value">{stats.completed}</span></div>
                      <div className="detail-item"><span className="label">Days on the road</span><span className="value">{stats.totalDays}</span></div>
                      <div className="detail-item"><span className="label">Total spent</span><span className="value">{rupees(stats.totalSpent)}</span></div>
                    </>
                  )}
                </div>
              </div>
              <div className="panel profile-panel">
                <h3>Change password</h3>
                <PasswordForm url="/me/password" />
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default Profile;
