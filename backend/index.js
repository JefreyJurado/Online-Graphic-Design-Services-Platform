const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://jefreyjurado.github.io',
    'https://jefrey-design.vercel.app'

  ],
  credentials: true
}));

app.use(express.json());

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
// Debug: Load Unsplash routes
console.log('🔍 Attempting to load Unsplash routes...');
try {
  const unsplashRoutes = require('./routes/unsplash');
  app.use('/api/unsplash', unsplashRoutes);
  console.log('✅ Unsplash routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Unsplash routes:', error);
}

app.get('/', (req, res) => {
  res.json({
    message: 'Design Platform API Running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      services: 'GET /api/services',
      quotations: 'GET /api/quotations',
      unsplashSearch: 'GET /api/unsplash/search?query=logo',
      unsplashRandom: 'GET /api/unsplash/random?count=5'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});