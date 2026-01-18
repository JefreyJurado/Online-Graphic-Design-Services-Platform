const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// ===== Existing Routes =====
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));

// ===== NEW: Unsplash API Routes =====
app.use('/api/unsplash', require('./routes/unsplash'));

app.get('/', (req, res) => {
  res.json({
    message: 'Design Platform API Running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      services: 'GET /api/services',
      quotations: 'GET /api/quotations',
      unsplashSearch: 'GET /api/unsplash/search?query=logo',  // NEW
      unsplashRandom: 'GET /api/unsplash/random?count=5'      // NEW
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`✓ Unsplash API routes mounted at /api/unsplash`);
});