const axios = require('axios');

async function testFeaturedAPI() {
  try {
    console.log('🧪 Testing Featured Services API...\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Test 1: Get featured services
    console.log('1️⃣ Testing GET /api/services?featured=true');
    const featured = await axios.get(`${baseURL}/services?featured=true`);
    console.log(`   ✅ Featured services: ${featured.data.services?.length || 0}`);
    if (featured.data.services?.length > 0) {
      featured.data.services.forEach(s => {
        console.log(`      - ${s.id}: ${s.title} (featured: ${s.is_featured})`);
      });
    }
    console.log('');
    
    // Test 2: Get trending services
    console.log('2️⃣ Testing GET /api/services/trending');
    const trending = await axios.get(`${baseURL}/services/trending`);
    console.log(`   ✅ Trending services: ${trending.data.services?.length || 0}`);
    if (trending.data.services?.length > 0) {
      trending.data.services.forEach(s => {
        console.log(`      - ${s.id}: ${s.title} (trending: ${s.is_trending})`);
      });
    }
    console.log('');
    
    // Test 3: Get all services
    console.log('3️⃣ Testing GET /api/services (all)');
    const all = await axios.get(`${baseURL}/services`);
    console.log(`   ✅ All services: ${all.data.services?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFeaturedAPI();
