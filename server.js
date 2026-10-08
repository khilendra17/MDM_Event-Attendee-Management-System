const express = require('express');
const cors = require('cors');
const path = require('path');

const eventsRouter = require('./routes/events');
const attendeesRouter = require('./routes/attendees');
const statsRouter = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware: JSON parsing
app.use(express.json());

// Middleware: Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Middleware: Static file server
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/attendees', attendeesRouter);
app.use('/api/stats', statsRouter);

// Fallback route for SPA / direct link navigation to index.html
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🌌 EventHorizon System running on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
