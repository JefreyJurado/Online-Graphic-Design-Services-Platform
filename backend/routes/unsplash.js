const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const unsplashService = require('../services/unsplashService');
const { validateSearchQuery } = require('../validators/unsplashValidator');

// Rate limiter: 100 requests per 15 minutes per IP
// This protects your app from abuse and helps stay within Unsplash's 50 req/hour limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    success: false, 
    message: 'Too many requests from this IP. Please try again in 15 minutes.' 
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
});

/**
 * @route   GET /api/unsplash/search
 * @desc    Search for photos on Unsplash
 * @access  Public
 * @params  query (required), page (optional), per_page (optional)
 */
router.get('/search', limiter, validateSearchQuery, async (req, res) => {
  try {
    const { query, page = 1, per_page = 10 } = req.query;
    
    console.log(`🔍 Search request: "${query}" (page ${page}, ${per_page} results)`);
    
    const results = await unsplashService.searchPhotos(
      query, 
      parseInt(page), 
      parseInt(per_page)
    );

    res.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('❌ Unsplash search error:', error);
    
    // Handle rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Unsplash API rate limit exceeded. Please try again in an hour.',
        cached: error.cached || false
      });
    }

    // Handle other errors
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to search images',
      details: process.env.NODE_ENV === 'development' ? error.details : undefined
    });
  }
});

/**
 * @route   GET /api/unsplash/random
 * @desc    Get random photos from Unsplash
 * @access  Public
 * @params  count (optional), query (optional)
 */
router.get('/random', limiter, async (req, res) => {
  try {
    const { count = 5, query } = req.query;
    
    // Validate count
    const photoCount = Math.min(Math.max(parseInt(count) || 5, 1), 30);
    
    console.log(`🎲 Random photos request: ${photoCount} photos${query ? ` (${query})` : ''}`);
    
    const results = await unsplashService.getRandomPhotos(photoCount, query);

    res.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('❌ Unsplash random error:', error);
    
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to fetch random images',
      details: process.env.NODE_ENV === 'development' ? error.details : undefined
    });
  }
});

module.exports = router;