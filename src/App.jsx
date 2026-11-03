import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVehicles from "./pages/AdminVehicles";
import AdminDrivers from "./pages/AdminDrivers";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLogin from "./pages/AdminLogin";

// Protected Customer Route: sends guests to login and brings them back afterwards
const UserRoute = ({ element }) => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? element : <Navigate to="/login" replace state={{ from: location.pathname, fromState: location.state }} />;
};

// Protected Admin Route
const AdminRoute = ({ element }) => {
  const isAdminLoggedIn = localStorage.getItem("adminToken");
  return isAdminLoggedIn ? element : <Navigate to="/admin-login" replace />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{background:'#000', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'}}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Vehicle details are public; booking steps need a login */}
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<UserRoute element={<Payment />} />} />
        <Route path="/confirmation" element={<UserRoute element={<Confirmation />} />} />
        <Route path="/dashboard" element={<UserRoute element={<CustomerDashboard />} />} />
        <Route path="/my-bookings" element={<Navigate to="/dashboard" replace />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
        <Route path="/admin/vehicles" element={<AdminRoute element={<AdminVehicles />} />} />
        <Route path="/admin/drivers" element={<AdminRoute element={<AdminDrivers />} />} />
        <Route path="/admin/bookings" element={<AdminRoute element={<AdminBookings />} />} />
        <Route path="/admin/analytics" element={<AdminRoute element={<AdminAnalytics />} />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
