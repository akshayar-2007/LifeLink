import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import API from "../utils/api";

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch unread notification count
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
    }
  }, [isLoggedIn, location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // silently fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Helper to check active page
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-red-600 text-lg hidden sm:block">
              Blood Donor Finder
            </span>
            <span className="font-bold text-red-600 text-lg sm:hidden">
              BDF
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive("/dashboard")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive("/search")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Find Donors
              </Link>

              <Link
                to="/request"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive("/request")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Request Blood
              </Link>

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive("/profile")
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {user?.name?.split(" ")[0]}
              </Link>

              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t">
            {isLoggedIn ? (
              <div className="flex flex-col gap-1">
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/search" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Find Donors</Link>
                <Link to="/request" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Request Blood</Link>
                <Link to="/notifications" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>
                  Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{unreadCount}</span>}
                </Link>
                <Link to="/profile" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="mx-4 mt-2 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link to="/login" className="py-2 text-center text-red-600 border border-red-600 rounded-lg" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="py-2 text-center bg-red-600 text-white rounded-lg" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;