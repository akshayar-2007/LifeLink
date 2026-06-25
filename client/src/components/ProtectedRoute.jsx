import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This component wraps pages that need login
// If not logged in → redirect to /login
// If logged in → show the page

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is logged in → show the page
  return children;
};

export default ProtectedRoute;