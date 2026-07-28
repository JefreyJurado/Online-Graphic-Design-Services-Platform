// Vercel entry point. All app setup lives in ./app.js — this file only starts
// the server. Keep server.js (local dev) and index.js (deployed) as thin
// wrappers so the two never drift apart again.
const app = require('./app');

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
