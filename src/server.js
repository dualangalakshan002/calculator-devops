// Entry point - starts the HTTP server.
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Calculator app running on port ${PORT}`);
});

// Graceful shutdown - important when Docker stops the container.
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});