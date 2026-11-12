import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
// Customer
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import VehicleDetails from "./pages/VehicleDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import History from "./pages/History";
import BookingDetails from "./pages/BookingDetails";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
// Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVehicles from "./pages/AdminVehicles";
import AdminDrivers from "./pages/AdminDrivers";
import AdminUsers from "./pages/AdminUsers";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminNotifications from "./pages/AdminNotifications";
// Driver
import DriverRegister from "./pages/DriverRegister";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/DriverDashboard";
import DriverBookings from "./pages/DriverBookings";
import TripDetails from "./pages/TripDetails";
import DriverEarnings from "./pages/DriverEarnings";
import DriverProfile from "./pages/DriverProfile";

// Customer pages: guests are sent to login and brought back to the same page afterwards
const UserRoute = ({ element }) => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? element : <Navigate to="/login" replace state={{ from: location.pathname, fromState: location.state }} />;
};

const AdminRoute = ({ element }) =>
  localStorage.getItem("adminToken") ? element : <Navigate to="/admin/login" replace />;

const DriverRoute = ({ element }) =>
  localStorage.getItem("driverToken") ? element : <Navigate to="/driver/login" replace />;

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280'}}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer */}
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/vehicle/:id" element={<VehicleDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking/:id" element={<UserRoute element={<Booking />} />} />
        <Route path="/payment/:id" element={<UserRoute element={<Payment />} />} />
        <Route path="/confirmation" element={<UserRoute element={<Confirmation />} />} />
        <Route path="/history" element={<UserRoute element={<History />} />} />
        <Route path="/history/:code" element={<UserRoute element={<BookingDetails />} />} />
        <Route path="/profile" element={<UserRoute element={<Profile />} />} />
        <Route path="/notifications" element={<UserRoute element={<Notifications />} />} />
        <Route path="/reviews" element={<UserRoute element={<Reviews />} />} />
        <Route path="/reviews/:code" element={<UserRoute element={<Reviews />} />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/vehicles" element={<AdminRoute element={<AdminVehicles />} />} />
        <Route path="/admin/drivers" element={<AdminRoute element={<AdminDrivers />} />} />
        <Route path="/admin/users" element={<AdminRoute element={<AdminUsers />} />} />
        <Route path="/admin/bookings" element={<AdminRoute element={<AdminBookings />} />} />
        <Route path="/admin/analytics" element={<AdminRoute element={<AdminAnalytics />} />} />
        <Route path="/admin/reports" element={<AdminRoute element={<AdminReports />} />} />
        <Route path="/admin/notifications" element={<AdminRoute element={<AdminNotifications />} />} />

        {/* Driver */}
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/dashboard" element={<DriverRoute element={<DriverDashboard />} />} />
        <Route path="/driver/bookings" element={<DriverRoute element={<DriverBookings />} />} />
        <Route path="/driver/trips/:id" element={<DriverRoute element={<TripDetails />} />} />
        <Route path="/driver/earnings" element={<DriverRoute element={<DriverEarnings />} />} />
        <Route path="/driver/profile" element={<DriverRoute element={<DriverProfile />} />} />

        {/* Old addresses */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/dashboard" element={<Navigate to="/history" replace />} />
        <Route path="/my-bookings" element={<Navigate to="/history" replace />} />
        <Route path="/payment" element={<Navigate to="/home" replace />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
