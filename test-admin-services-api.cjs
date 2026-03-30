const axios = require('axios');

async function testAdminServicesAPI() {
  try {
    console.log('🧪 Testing Admin Services API...\n');
    
    const baseURL = 'http://localhost:5000/api/admin';
    
    // Test 1: Get all services
    console.log('1️⃣ Testing GET /api/admin/services');
    const allServices = await axios.get(`${baseURL}/services`);
    console.log(`   ✅ Response: ${allServices.data.services?.length || 0} services`);
    console.log(`   Pagination: page ${allServices.data.pagination?.page}, total ${allServices.data.pagination?.total}\n`);
    
    // Test 2: Get stats
    console.log('2️⃣ Testing GET /api/admin/services/stats');
    const stats = await axios.get(`${baseURL}/services/stats`);
    console.log(`   ✅ Stats:`, stats.data.stats);
    console.log('');
    
    // Test 3: Get categories
    console.log('3️⃣ Testing GET /api/admin/services/categories');
    const categories = await axios.get(`${baseURL}/services/categories`);
    console.log(`   ✅ Categories: ${categories.data.categories?.length || 0}`);
    categories.data.categories?.forEach(cat => {
      console.log(`      - ${cat.category}: ${cat.count} services`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminServicesAPI();
