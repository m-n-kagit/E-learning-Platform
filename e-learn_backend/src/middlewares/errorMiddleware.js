// Global error handler.
// Express identifies error-handling middleware by its 4-argument signature: (err, req, res, next)
// This MUST be the last app.use() in app.js

const getStatusCode = (err, res) => {
  // 1) Prefer explicit status from error object.
  if (Number.isInteger(err?.statusCode) && err.statusCode >= 400 && err.statusCode <= 599) {
    return err.statusCode;
  }
  if (Number.isInteger(err?.status) && err.status >= 400 && err.status <= 599) {
    return err.status;
  }

  // 2) Keep status already set on response.
  if (res.statusCode >= 400 && res.statusCode <= 599) {
    return res.statusCode;
  }

  // 3) Common fallback mappings.
  if (err?.name === "ValidationError") return 400;   // Mongoose validation error
  if (err?.name === "CastError") return 400;         // Invalid ObjectId, etc.
  if (err?.code === 11000) return 409;               // Duplicate key
  if (err?.name === "JsonWebTokenError") return 401; // Invalid JWT
  if (err?.name === "TokenExpiredError") return 401; // Expired JWT

  // 4) Default.
  return 500;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = getStatusCode(err, res);

  res.status(statusCode).json({
    success: false,
    message: err?.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
  });
};

export default errorHandler;
