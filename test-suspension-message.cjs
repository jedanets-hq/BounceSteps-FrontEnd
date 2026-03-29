const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_API_URL = 'http://localhost:5000/api/admin';

async function testSuspensionMessage() {
  console.log('🧪 Testing Suspension Message\n');

  try {
    // 1. Get a test user
    console.log('1️⃣ Fetching users...');
    const usersResponse = await axios.get(`${ADMIN_API_URL}/users?limit=5`);
    const users = usersResponse.data.users;
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    const testUser = users.find(u => u.user_type === 'traveler') || users[0];
    console.log(`✅ Using test user: ${testUser.email} (ID: ${testUser.id})\n`);

    // 2. Suspend user
    console.log('2️⃣ Suspending user...');
    await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/suspend`);
    console.log('✅ User suspended\n');

    // 3. Try to login
    console.log('3️⃣ Testing login with suspended account...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: 'test123'
      });
      console.log('❌ Login should have been blocked!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Login blocked successfully');
        console.log('📝 Message received:');
        console.log(`   "${error.response.data.message}"`);
        console.log(`\n✅ Code: ${error.response.data.code}\n`);
        
        // Check if message is in English
        if (error.response.data.message.includes('support@isafari.co.tz')) {
          console.log('✅ Message contains support email');
        }
        if (error.response.data.message.includes('Your account has been suspended')) {
          console.log('✅ Message is in English');
        }
      } else {
        console.log(`⚠️  Different error: ${error.response?.data?.message || error.message}`);
      }
    }

    // 4. Restore user
    console.log('\n4️⃣ Restoring user...');
    await axios.post(`${ADMIN_API_URL}/users/${testUser.id}/restore`);
    console.log('✅ User restored\n');

    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSuspensionMessage();
