import PortalLayout from "./PortalLayout";

const ADMIN_PORTAL = {
  label: "Admin",
  defaultName: "Admin",
  tokenKey: "adminToken",
  userKey: "adminUser",
  loginPath: "/admin/login",
  unreadUrl: "/admin/notifications/unread-count",
  links: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/vehicles", label: "Vehicles" },
    { to: "/admin/drivers", label: "Drivers" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/notifications", label: "Notifications", showUnread: true },
  ],
};

const AdminLayout = (props) => <PortalLayout portal={ADMIN_PORTAL} {...props} />;

export default AdminLayout;
