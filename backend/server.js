// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/database');
const passport = require('./config/passport');

const app = express();

// Security Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Passport
app.use(passport.initialize());

// Debug middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
connectDB();

// Import rate limiters
const { apiLimiter } = require('./middleware/rateLimiter');

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/api/unsplash', require('./routes/unsplash'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Design Platform API Running',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      googleAuth: 'GET /api/auth/google',
      googleCallback: 'GET /api/auth/google/callback',
      services: 'GET /api/services',
      quotations: 'GET /api/quotations',
      unsplashSearch: 'GET /api/unsplash/search?query=logo',
      unsplashRandom: 'GET /api/unsplash/random?count=5',
      uploadProfile: 'POST /api/upload/profile',
      uploadServiceImage: 'POST /api/upload/service/:id'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`✓ Basic security enabled (CORS)`);
  console.log(`✓ Rate limiting enabled`);
  console.log(`✓ Input validation enabled`);
  console.log(`✓ Unsplash API routes mounted at /api/unsplash`);
  console.log(`✓ Upload routes mounted at /api/upload`);
  console.log(`✓ Google OAuth routes mounted at /api/auth/google`);
});