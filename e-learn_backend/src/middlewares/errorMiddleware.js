// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Express identifies error-handling middleware by its 4-argument signature: (err, req, res, next)
// This MUST be the last app.use() in server.js

const errorHandler = (err, req, res, next) => {
  // Use status already set on res, or fall back to 500 (Internal Server Error)
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",

    // Stack trace only in development — never expose in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
