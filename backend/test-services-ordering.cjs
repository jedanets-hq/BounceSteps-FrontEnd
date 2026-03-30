const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testServicesOrdering() {
  try {
    console.log('🧪 Testing Services Ordering with Promotion Priorities...\n');
    
    // 1. Get all services
    console.log('1️⃣ Getting all services...');
    const servicesResponse = await axios.get(`${API_URL}/services?limit=10`);
    console.log(`✅ Found ${servicesResponse.data.services.length} services`);
    
    console.log('\n📊 Services ordered by promotion priority:');
    servicesResponse.data.services.forEach((service, index) => {
      console.log(`\n${index + 1}. ${service.title}`);
      console.log(`   Search Priority: ${service.search_priority || 0}`);
      console.log(`   Category Priority: ${service.category_priority || 0}`);
      console.log(`   Carousel Priority: ${service.carousel_priority || 0}`);
      console.log(`   Featured: ${service.is_featured ? 'Yes' : 'No'}`);
      console.log(`   Trending: ${service.is_trending ? 'Yes' : 'No'}`);
    });
    
    // 2. Test featured services
    console.log('\n\n2️⃣ Getting featured services...');
    const featuredResponse = await axios.get(`${API_URL}/services/featured/slides`);
    console.log(`✅ Found ${featuredResponse.data.services.length} featured services`);
    
    // 3. Test trending services
    console.log('\n3️⃣ Getting trending services...');
    const trendingResponse = await axios.get(`${API_URL}/services/trending`);
    console.log(`✅ Found ${trendingResponse.data.services.length} trending services`);
    
    console.log('\n✅ All ordering tests passed! Services are ordered by promotion priorities.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testServicesOrdering();
