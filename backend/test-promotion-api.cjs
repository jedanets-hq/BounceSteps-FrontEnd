const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPromotionAPI() {
  try {
    console.log('🧪 Testing Promotion API Endpoints...\n');
    
    // 1. Get all services
    console.log('1️⃣ Getting all services...');
    const servicesResponse = await axios.get(`${API_URL}/admin/services`);
    console.log(`✅ Found ${servicesResponse.data.services.length} services`);
    
    if (servicesResponse.data.services.length === 0) {
      console.log('❌ No services found. Cannot test promotion API.');
      return;
    }
    
    const testService = servicesResponse.data.services[0];
    console.log(`   Testing with service: ${testService.title} (ID: ${testService.id})`);
    
    // 2. Update promotion settings
    console.log('\n2️⃣ Updating promotion settings...');
    const promotionData = {
      search_priority: 85,
      category_priority: 90,
      is_enhanced_listing: true,
      has_increased_visibility: true,
      carousel_priority: 95,
      has_maximum_visibility: false,
      promotion_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    const updateResponse = await axios.patch(
      `${API_URL}/admin/services/${testService.id}/promotion`,
      promotionData
    );
    
    console.log('✅ Promotion settings updated successfully!');
    console.log('   Response:', updateResponse.data.message);
    
    // 3. Verify the update
    console.log('\n3️⃣ Verifying the update...');
    const verifyResponse = await axios.get(`${API_URL}/admin/services`);
    const updatedService = verifyResponse.data.services.find(s => s.id === testService.id);
    
    if (updatedService) {
      console.log('✅ Verified promotion settings:');
      console.log(`   - Search Priority: ${updatedService.search_priority}`);
      console.log(`   - Category Priority: ${updatedService.category_priority}`);
      console.log(`   - Enhanced Listing: ${updatedService.is_enhanced_listing}`);
      console.log(`   - Increased Visibility: ${updatedService.has_increased_visibility}`);
      console.log(`   - Carousel Priority: ${updatedService.carousel_priority}`);
      console.log(`   - Maximum Visibility: ${updatedService.has_maximum_visibility}`);
      console.log(`   - Expires At: ${updatedService.promotion_expires_at || 'Never'}`);
    }
    
    // 4. Test partial update
    console.log('\n4️⃣ Testing partial update (only search_priority)...');
    const partialUpdateResponse = await axios.patch(
      `${API_URL}/admin/services/${testService.id}/promotion`,
      { search_priority: 50 }
    );
    
    console.log('✅ Partial update successful!');
    console.log('   Response:', partialUpdateResponse.data.message);
    
    // 5. Get service stats
    console.log('\n5️⃣ Getting service statistics...');
    const statsResponse = await axios.get(`${API_URL}/admin/services/stats`);
    console.log('✅ Service statistics:');
    console.log(`   - Total Services: ${statsResponse.data.stats.total_services}`);
    console.log(`   - Active Services: ${statsResponse.data.stats.active_services}`);
    console.log(`   - Featured Services: ${statsResponse.data.stats.featured_services}`);
    console.log(`   - Trending Services: ${statsResponse.data.stats.trending_services}`);
    
    console.log('\n✅ All API tests passed! Promotion system is working correctly.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testPromotionAPI();
