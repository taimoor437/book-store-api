/**
 * Request Logger Middleware
 * Logs every incoming request: method, endpoint, and date/time
 */
const requestLogger = (req, res, next) => {
  const now = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;

  console.log(`[${now}]  ${method}  ${url}`);

  next();
};

module.exports = requestLogger;
