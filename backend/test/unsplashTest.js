const axios = require('axios');
require('dotenv').config();

async function testUnsplash() {
  console.log('🔍 Testing Unsplash API connection...\n');
  
  // Check if API key exists
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error('❌ ERROR: UNSPLASH_ACCESS_KEY not found in .env file');
    return;
  }
  
  console.log('✓ API Key found in environment variables');
  console.log('✓ API Key starts with:', process.env.UNSPLASH_ACCESS_KEY.substring(0, 10) + '...\n');
  
  try {
    console.log('📡 Fetching 5 random design images...\n');
    
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      params: {
        count: 5,
        query: 'logo design'
      }
    });
    
    console.log('✅ API Connection Successful!\n');
    console.log(`📸 Received ${response.data.length} images\n`);
    
    // Display sample image info
    const sampleImage = response.data[0];
    console.log('📋 Sample Image Details:');
    console.log('   ID:', sampleImage.id);
    console.log('   Description:', sampleImage.description || sampleImage.alt_description);
    console.log('   Photographer:', sampleImage.user.name);
    console.log('   Regular URL:', sampleImage.urls.regular);
    console.log('   Thumb URL:', sampleImage.urls.thumb);
    console.log('\n✅ Test completed successfully!');
    console.log('🎉 Your Unsplash API integration is ready to use!\n');
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if your API key is correct in .env file');
    console.error('   2. Verify you accepted Unsplash API terms');
    console.error('   3. Make sure your application is approved on Unsplash\n');
  }
}

testUnsplash();