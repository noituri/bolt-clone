const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const ridesRoutes = require('./routes/rides');
app.use('/rides', ridesRoutes);

// Health check endpoint
app.get('/ping', (req, res) => {
  res.json({ msg: 'ride-service up and running' });
});

// Start server
app.listen(port, () => {
  console.log(`Ride-service listening on port ${port}`);
});

// Uruchom usługę kolejki
const queueService = require('./services/queueService');
queueService.start();

// Obsługa poprawnego zamykania
process.on('SIGINT', () => {
  queueService.stop();
  process.exit(0);
});