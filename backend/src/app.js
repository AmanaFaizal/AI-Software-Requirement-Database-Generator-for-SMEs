const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BizGuide AI backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Central error handler (catches anything thrown/passed to next())
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

module.exports = app;
