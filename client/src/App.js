import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
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
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
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

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;