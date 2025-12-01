/**
 * Express App Configuration
 *
 * This file sets up the Express application with middleware,
 * routes, and error handlers.
 */

const express = require("express");
const cors = require("cors");

const app = express();

// ============================================
// Middleware
// ============================================

// Enable CORS for all routes (allows frontend to communicate with API)
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// Log incoming requests (simple logger)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check endpoint - verify API is running
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "BYUI Clubs API is running",
    timestamp: new Date().toISOString(),
  });
});

// Import and use route modules
const clubRoutes = require('./routes/clubRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/clubs', clubRoutes);
app.use('/api/categories', categoryRoutes);

// ============================================
// Error Handlers
// ============================================

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global Error Handler - catches all errors
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
