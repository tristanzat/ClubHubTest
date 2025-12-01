/**
 * Server Entry Point
 *
 * This file starts the HTTP server and listens for incoming requests.
 * It loads environment variables and imports the Express app configuration.
 */

// Load environment variables FIRST before importing anything else
require("dotenv").config();

const app = require("./src/app");

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
