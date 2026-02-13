const axios = require('axios');

const UNSPLASH_API_URL = 'https://api.unsplash.com';
const cache = new Map(); // In-memory cache
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

class UnsplashService {
  constructor() {
    this.apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!this.apiKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not configured in environment variables');
    }
  }

  async searchPhotos(query, page = 1, perPage = 10) {
    const cacheKey = `search:${query}:${page}:${perPage}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('✓ Cache hit for:', cacheKey);
      return { ...cached, cached: true };
    }

    try {
      console.log(`📡 Fetching from Unsplash API: ${query} (page ${page})`);
      
      const response = await axios.get(`${UNSPLASH_API_URL}/search/photos`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        },
        params: {
          query,
          page,
          per_page: perPage
        },
        timeout: 10000 // 10 second timeout
      });

      const data = {
        total: response.data.total,
        total_pages: response.data.total_pages,
        results: response.data.results.map(photo => this.formatPhoto(photo))
      };

      // Store in cache
      this.setCache(cacheKey, data);
      console.log('✓ Results cached for 5 minutes');

      return data;
    } catch (error) {
      // Handle rate limit (429) - try to return cached results
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit exceeded! Checking for cached results...');
        const anyCached = this.getAnyCachedSearch();
        if (anyCached) {
          console.log('✓ Returning cached results as fallback');
          return { 
            ...anyCached, 
            cached: true, 
            message: 'Rate limit exceeded. Showing cached results.' 
          };
        }
      }
      throw this.handleError(error);
    }
  }

  async getRandomPhotos(count = 5, query = null) {
    try {
      console.log(`📡 Fetching ${count} random photos${query ? ` for "${query}"` : ''}`);
      
      const params = { count: Math.min(count, 30) }; // Max 30
      if (query) params.query = query;

      const response = await axios.get(`${UNSPLASH_API_URL}/photos/random`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        },
        params,
        timeout: 10000
      });

      const photos = Array.isArray(response.data) ? response.data : [response.data];
      
      return {
        results: photos.map(photo => this.formatPhoto(photo))
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  formatPhoto(photo) {
    return {
      unsplashId: photo.id,
      url: photo.urls.regular, // 1080px width
      thumbUrl: photo.urls.thumb, // 200px width
      description: photo.description || photo.alt_description || '',
      photographer: {
        name: photo.user.name,
        username: photo.user.username,
        profileLink: `https://unsplash.com/@${photo.user.username}`
      },
      photoLink: photo.links.html
    };
  }

  getFromCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;

    // Check if expired (older than 5 minutes)
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }

  getAnyCachedSearch() {
    for (let [key, value] of cache.entries()) {
      if (key.startsWith('search:') && Date.now() - value.timestamp <= CACHE_TTL) {
        console.log('✓ Found cached search:', key);
        return value.data;
      }
    }
    return null;
  }

  handleError(error) {
    if (error.response) {
      // API responded with error
      const status = error.response.status;
      const message = error.response.data.errors?.[0] || 'Unsplash API error';
      
      console.error(`❌ Unsplash API Error (${status}):`, message);
      
      return {
        status,
        message,
        details: error.response.data
      };
    } else if (error.request) {
      // Request made but no response (network error)
      console.error('❌ Network Error:', error.message);
      return {
        status: 503,
        message: 'Failed to connect to Unsplash API. Please check your internet connection.',
        details: error.message
      };
    } else {
      // Other errors
      console.error('❌ Error:', error.message);
      return {
        status: 500,
        message: 'An unexpected error occurred',
        details: error.message
      };
    }
  }
}

// Export a single instance (singleton pattern)
module.exports = new UnsplashService();