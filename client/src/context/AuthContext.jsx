import { createContext, useState, useContext } from "react";

// Create the context
const AuthContext = createContext();

// AuthProvider wraps the whole app
// Any component inside can access auth data
export const AuthProvider = ({ children }) => {

  // Initialize from localStorage
  // So user stays logged in after page refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Login function — called after successful login/register
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  // Logout function — clears everything
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update user in context (after profile update)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // isLoggedIn helper
  const isLoggedIn = !!user && !!token;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      updateUser,
      isLoggedIn 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — makes using context easier
// Instead of: const { user } = useContext(AuthContext)
// Just use:   const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};