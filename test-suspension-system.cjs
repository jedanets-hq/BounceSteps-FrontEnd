const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_API_URL = 'http://localhost:5000/api/admin';

async function testSuspensionSystem() {
  console.log('🧪 Testing Suspension System\n');

  try {
    // 1. Get all users to find a test user
    console.log('1️⃣ Fetching users...');
    const usersResponse = await axios.get(`${ADMIN_API_URL}/users?limit=5`);
    const users = usersResponse.data.users;
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users.find(u => u.user_type === 'traveler') || users[0];
    console.log(`✅ Found test user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`   Current status: ${testUser.is_active ? 'Active' : 'Suspended'}\n`);

    // 2. Test suspension
    console.log('2️⃣ Testing user suspension...');
    const suspendResponse = await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/suspend`, {
      reason: 'Testing suspension system'
    });
    console.log(`✅ User suspended: ${suspendResponse.data.message}`);
    console.log(`   User is_active: ${suspendResponse.data.user.is_active}\n`);

    // 3. Try to login with suspended account
    console.log('3️⃣ Testing login with suspended account...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: 'test123' // This will likely fail but we're testing the suspension check
      });
      console.log('❌ Login should have been blocked!');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_BLOCKED') {
        console.log('✅ Login correctly blocked for suspended account');
        console.log(`   Message: ${error.response.data.message}\n`);
      } else {
        console.log(`⚠️  Login failed with different error: ${error.response?.data?.message || error.message}\n`);
      }
    }

    // 4. Test services visibility for suspended provider
    console.log('4️⃣ Testing services visibility...');
    const servicesResponse = await axios.get(`${API_URL}/services?limit=10`);
    const suspendedUserServices = servicesResponse.data.services.filter(
      s => s.provider_user_id === testUser.id
    );
    
    if (suspendedUserServices.length === 0) {
      console.log('✅ No services visible from suspended user (correct behavior)\n');
    } else {
      console.log(`❌ Found ${suspendedUserServices.length} services from suspended user (should be 0)\n`);
    }

    // 5. Test restoration
    console.log('5️⃣ Testing user restoration...');
    const restoreResponse = await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/restore`);
    console.log(`✅ User restored: ${restoreResponse.data.message}`);
    console.log(`   User is_active: ${restoreResponse.data.user.is_active}\n`);

    // 6. Test provider suspension
    console.log('6️⃣ Testing provider suspension...');
    const providersResponse = await axios.get(`${ADMIN_API_URL}/providers?limit=5`);
    const providers = providersResponse.data.providers;
    
    if (providers.length > 0) {
      const testProvider = providers[0];
      console.log(`   Testing with provider: ${testProvider.business_name} (ID: ${testProvider.id})`);
      
      // Suspend provider
      const suspendProviderResponse = await axios.post(
        `${ADMIN_API_URL}/providers/${testProvider.id}/suspend`,
        { reason: 'Testing provider suspension' }
      );
      console.log(`✅ Provider suspended: ${suspendProviderResponse.data.message}`);
      
      // Check if services are hidden
      const servicesAfterSuspend = await axios.get(`${API_URL}/services?limit=100`);
      const providerServices = servicesAfterSuspend.data.services.filter(
        s => s.provider_id === testProvider.id
      );
      
      if (providerServices.length === 0) {
        console.log('✅ All provider services hidden (correct behavior)');
      } else {
        console.log(`❌ Found ${providerServices.length} services still visible (should be 0)`);
      }
      
      // Restore provider
      const restoreProviderResponse = await axios.post(
        `${ADMIN_API_URL}/providers/${testProvider.id}/restore`
      );
      console.log(`✅ Provider restored: ${restoreProviderResponse.data.message}\n`);
    } else {
      console.log('⚠️  No providers found to test\n');
    }

    console.log('✅ All suspension tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSuspensionSystem();
