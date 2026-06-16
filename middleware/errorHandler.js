/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a JSON response
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
