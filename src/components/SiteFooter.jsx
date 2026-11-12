import { Link } from "react-router-dom";

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="container">
      <span>© {new Date().getFullYear()} SmartRide Rentals · Hyderabad · Bengaluru · Mumbai</span>
      <span>Need help? Call 040-4567-8900 or write to support@smartride.in</span>
      <span>
        <Link to="/driver/register">Drive with us</Link> · <Link to="/driver/login">Driver login</Link> ·{" "}
        <Link to="/admin/login">Staff login</Link>
      </span>
    </div>
  </footer>
);

export default SiteFooter;
