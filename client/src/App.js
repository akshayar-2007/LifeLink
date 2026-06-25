import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SearchDonors from "./pages/SearchDonors";
import EmergencyRequest from "./pages/EmergencyRequest";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

function App() {
  return (
    // AuthProvider wraps everything
    // So all components can access user data
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>

          {/* Public Routes — anyone can access */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes — must be logged in */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute><SearchDonors /></ProtectedRoute>
          } />
          <Route path="/request" element={
            <ProtectedRoute><EmergencyRequest /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />

          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
