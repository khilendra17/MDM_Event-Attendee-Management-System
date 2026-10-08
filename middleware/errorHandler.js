function errorHandler(err, req, res, next) {
  console.error('Unhandled API Error:', err);

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate registration: This email is already registered for this event'
    });
  }

  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation'
    });
  }

  // Generic internal server error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred'
  });
}

module.exports = errorHandler;
