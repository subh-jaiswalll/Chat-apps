const jwt = require("jsonwebtoken");

// ========================================
// SOCKET.IO AUTHENTICATION
// ========================================

function socketMiddleware(socket, next) {
  // Get token

  const token = socket.handshake.auth.token;

  // Check token

  if (!token) {
    return next(new Error("Authentication token is required"));
  }

  try {
    // Verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store user in socket

    socket.user = decoded;

    // Authentication successful

    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
}

module.exports = socketMiddleware;
