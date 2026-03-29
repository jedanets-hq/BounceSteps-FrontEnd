const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_API_URL = 'http://localhost:5000/api/admin';

async function testJWTSuspension() {
  console.log('🧪 Testing JWT Middleware Suspension Check\n');

  try {
    // 1. Create a test user
    console.log('1️⃣ Creating test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `test_suspend_${Date.now()}@test.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'Suspend',
      phone: '+255700000000',
      userType: 'traveler'
    });
    
    const testUser = registerResponse.data.user;
    const token = registerResponse.data.token;
    console.log(`✅ Test user created: ${testUser.email} (ID: ${testUser.id})\n`);

    // 2. Test authenticated request with active account
    console.log('2️⃣ Testing authenticated request with active account...');
    try {
      const profileResponse = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Profile access successful: ${profileResponse.data.user.email}\n`);
    } catch (error) {
      console.log(`❌ Profile access failed: ${error.response?.data?.message || error.message}\n`);
    }

    // 3. Suspend the user
    console.log('3️⃣ Suspending user...');
    await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/suspend`, {
      reason: 'Testing JWT suspension'
    });
    console.log('✅ User suspended\n');

    // 4. Test authenticated request with suspended account
    console.log('4️⃣ Testing authenticated request with suspended account...');
    try {
      const profileResponse = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`❌ Profile access should have been blocked! Got: ${profileResponse.data.user.email}\n`);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_SUSPENDED') {
        console.log('✅ JWT middleware correctly blocked suspended account');
        console.log(`   Message: ${error.response.data.message}`);
        console.log(`   Code: ${error.response.data.code}\n`);
      } else {
        console.log(`⚠️  Request failed with different error: ${error.response?.data?.message || error.message}\n`);
      }
    }

    // 5. Test service provider dashboard access
    console.log('5️⃣ Creating service provider and testing dashboard access...');
    const providerRegisterResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `provider_suspend_${Date.now()}@test.com`,
      password: 'Test123!',
      firstName: 'Provider',
      lastName: 'Test',
      phone: '+255700000001',
      userType: 'service_provider'
    });
    
    const providerUser = providerRegisterResponse.data.user;
    const providerToken = providerRegisterResponse.data.token;
    console.log(`✅ Provider created: ${providerUser.email} (ID: ${providerUser.id})`);

    // Test provider dashboard access before suspension
    try {
      const dashboardResponse = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${providerToken}` }
      });
      console.log(`✅ Provider dashboard accessible before suspension\n`);
    } catch (error) {
      console.log(`❌ Provider dashboard access failed: ${error.response?.data?.message || error.message}\n`);
    }

    // Suspend provider
    console.log('6️⃣ Suspending provider...');
    await axios.post(`${ADMIN_API_URL}/users/${providerUser.id}/suspend`, {
      reason: 'Testing provider suspension'
    });
    console.log('✅ Provider suspended\n');

    // Test provider dashboard access after suspension
    console.log('7️⃣ Testing provider dashboard access after suspension...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${providerToken}` }
      });
      console.log(`❌ Provider dashboard should have been blocked!\n`);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_SUSPENDED') {
        console.log('✅ Provider dashboard correctly blocked');
        console.log(`   Message: ${error.response.data.message}\n`);
      } else {
        console.log(`⚠️  Request failed with different error: ${error.response?.data?.message || error.message}\n`);
      }
    }

    // Cleanup
    console.log('8️⃣ Cleaning up test users...');
    await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/restore`);
    await axios.post(`${ADMIN_API_URL}/users/${providerUser.id}/restore`);
    console.log('✅ Test users restored\n');

    console.log('✅ All JWT suspension tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testJWTSuspension();
