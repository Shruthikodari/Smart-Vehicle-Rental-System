import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
// Login page removed per user request
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVehicles from "./pages/AdminVehicles";
import AdminDrivers from "./pages/AdminDrivers";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLogin from "./pages/AdminLogin";

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

        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        
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