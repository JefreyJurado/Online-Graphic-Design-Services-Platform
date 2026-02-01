const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.url}`);
  console.log('📋 Headers:', req.headers);
  next();
});

connectDB();

// ===== Existing Routes =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));

// ===== Unsplash API Routes =====
app.use('/api/unsplash', require('./routes/unsplash'));

// ===== NEW: Upload Routes (AWS S3) =====
app.use('/api/upload', require('./routes/uploadRoutes'));

app.get('/', (req, res) => {
  res.json({
    message: 'Design Platform API Running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      services: 'GET /api/services',
      quotations: 'GET /api/quotations',
      unsplashSearch: 'GET /api/unsplash/search?query=logo',
      unsplashRandom: 'GET /api/unsplash/random?count=5',
      uploadProfile: 'POST /api/upload/profile',
      uploadServiceImage: 'POST /api/upload/service/:id'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`✓ Unsplash API routes mounted at /api/unsplash`);
  console.log(`✓ Upload routes mounted at /api/upload`);
});