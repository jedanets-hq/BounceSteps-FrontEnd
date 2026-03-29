const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Portal Endpoints...\n');
  
  try {
    // Test 1: Dashboard Stats
    console.log('1️⃣ Testing Dashboard Stats...');
    const statsRes = await axios.get(`${API_URL}/api/admin/dashboard/stats?period=30days`);
    console.log('✅ Dashboard Stats:', JSON.stringify(statsRes.data, null, 2));
    console.log('');
    
    // Test 2: Dashboard Activity
    console.log('2️⃣ Testing Dashboard Activity...');
    const activityRes = await axios.get(`${API_URL}/api/admin/dashboard/activity?limit=5`);
    console.log('✅ Dashboard Activity:', JSON.stringify(activityRes.data, null, 2));
    console.log('');
    
    // Test 3: Get Users
    console.log('3️⃣ Testing Get Users...');
    const usersRes = await axios.get(`${API_URL}/api/admin/users?page=1&limit=5`);
    console.log('✅ Users:', JSON.stringify(usersRes.data, null, 2));
    console.log('');
    
    // Test 4: Get Providers
    console.log('4️⃣ Testing Get Providers...');
    const providersRes = await axios.get(`${API_URL}/api/admin/providers?page=1&limit=5`);
    console.log('✅ Providers:', JSON.stringify(providersRes.data, null, 2));
    console.log('');
    
    console.log('✅ All Admin Endpoints Working!');
    
  } catch (error) {
    console.error('❌ Error testing admin endpoints:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAdminEndpoints();
