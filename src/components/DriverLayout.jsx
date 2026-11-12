import PortalLayout from "./PortalLayout";

const DRIVER_PORTAL = {
  label: "Driver",
  defaultName: "Driver",
  tokenKey: "driverToken",
  userKey: "driverUser",
  loginPath: "/driver/login",
  unreadUrl: "/driver/notifications",
  links: [
    { to: "/driver/dashboard", label: "Dashboard", showUnread: true },
    { to: "/driver/bookings", label: "Assigned trips" },
    { to: "/driver/earnings", label: "Earnings" },
    { to: "/driver/profile", label: "Profile" },
  ],
};

const DriverLayout = (props) => <PortalLayout portal={DRIVER_PORTAL} {...props} />;

export default DriverLayout;
