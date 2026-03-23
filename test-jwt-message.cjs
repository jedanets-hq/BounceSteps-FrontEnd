const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_API_URL = 'http://localhost:5000/api/admin';

async function testJWTMessage() {
  console.log('🧪 Testing JWT Middleware Suspension Message\n');

  try {
    // 1. Create test user
    console.log('1️⃣ Creating test user...');
    const email = `test_jwt_${Date.now()}@test.com`;
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email,
      password: 'Test123!',
      firstName: 'JWT',
      lastName: 'Test',
      phone: '+255700000099',
      userType: 'traveler'
    });
    
    const user = registerResponse.data.user;
    const token = registerResponse.data.token;
    console.log(`✅ User created: ${user.email} (ID: ${user.id})\n`);

    // 2. Test profile access (should work)
    console.log('2️⃣ Testing profile access before suspension...');
    const profileResponse = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Profile accessible: ${profileResponse.data.user.email}\n`);

    // 3. Suspend user
    console.log('3️⃣ Suspending user...');
    await axios.post(`${ADMIN_API_URL}/users/${user.id}/suspend`);
    console.log('✅ User suspended\n');

    // 4. Test profile access after suspension
    console.log('4️⃣ Testing profile access after suspension...');
    try {
      await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Profile should have been blocked!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ JWT middleware blocked access');
        console.log('📝 Message received:');
        console.log(`   "${error.response.data.message}"`);
        console.log(`\n✅ Code: ${error.response.data.code}\n`);
        
        if (error.response.data.message.includes('support@isafari.co.tz')) {
          console.log('✅ Message contains support email');
        }
        if (error.response.data.message.includes('Your account has been suspended')) {
          console.log('✅ Message is in English');
        }
      }
    }

    // 5. Cleanup
    console.log('\n5️⃣ Cleaning up...');
    await axios.post(`${ADMIN_API_URL}/users/${user.id}/restore`);
    console.log('✅ User restored\n');

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testJWTMessage();
