const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { ensureDefaultAdmin, DEFAULT_ADMIN_EMAIL } = require('./services/storage');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const publicDir = path.join(__dirname, 'public');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection (skip in test mode - setup.js handles it)
if (process.env.NODE_ENV !== 'test') {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/innovatepam';
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    await ensureDefaultAdmin();
    console.log('✓ MongoDB connected');
    console.log(`✓ Default admin ready: ${DEFAULT_ADMIN_EMAIL}`);
  })
  .catch(err => console.error('✗ MongoDB connection error:', err.message));

  // Ensure demo login is available even when MongoDB is offline.
  ensureDefaultAdmin()
    .then(() => console.log(`✓ Fallback admin ready: ${DEFAULT_ADMIN_EMAIL}`))
    .catch(err => console.error('✗ Failed to prepare fallback admin:', err.message));
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));

// Dedicated role-based pages
app.get('/user', (req, res) => {
  res.sendFile(path.join(publicDir, 'user.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    defaultAdminEmail: DEFAULT_ADMIN_EMAIL
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 InnovatEPAM Portal running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
