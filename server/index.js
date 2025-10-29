const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const barangRoutes = require('./routes/barangRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (untuk foto yang diupload)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'TKJ Peminjaman API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/barang', barangRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV}`);
  const dbInfo = process.env.DATABASE_URL 
    ? `postgres://${process.env.DATABASE_URL.split('@')[1]}` 
    : `${process.env.DB_NAME}@${process.env.DB_HOST}`;
  console.log(`🗄️  Database: ${dbInfo}`);
});

module.exports = app;
