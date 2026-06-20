const jwt = require("jsonwebtoken");

// This middleware protects routes
// It checks if the request has a valid JWT token

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Header looks like: "Bearer eyJhbGc..."
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ 
        msg: "No token, authorization denied" 
      });
    }

    // Remove "Bearer " from token string
    const token = authHeader.replace("Bearer ", "");

    // Verify token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user id to request object
    // Now any route using this middleware can access req.user.id
    req.user = decoded;

    // Move to next function (the actual route handler)
    next();

  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;