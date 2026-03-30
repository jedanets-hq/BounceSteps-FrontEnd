const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testStoriesAPI() {
  try {
    console.log('🔍 Testing Traveler Stories API...\n');

    // 1. Test admin login
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@isafari.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log('Token:', token.substring(0, 20) + '...');

    // 2. Test getting all stories
    console.log('\n2️⃣ Testing GET /api/traveler-stories/admin/all...');
    try {
      const allStoriesResponse = await axios.get(`${API_URL}/traveler-stories/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', allStoriesResponse.status);
      console.log('Response data:', JSON.stringify(allStoriesResponse.data, null, 2));
      
      if (allStoriesResponse.data.success) {
        console.log(`✅ Found ${allStoriesResponse.data.stories.length} stories`);
        allStoriesResponse.data.stories.forEach(story => {
          console.log(`  - ${story.title} (${story.status})`);
        });
      } else {
        console.log('❌ Failed to get stories:', allStoriesResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error getting all stories:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }

    // 3. Test getting pending stories
    console.log('\n3️⃣ Testing GET /api/traveler-stories/admin/all?status=pending...');
    try {
      const pendingStoriesResponse = await axios.get(`${API_URL}/traveler-stories/admin/all?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', pendingStoriesResponse.status);
      
      if (pendingStoriesResponse.data.success) {
        console.log(`✅ Found ${pendingStoriesResponse.data.stories.length} pending stories`);
        pendingStoriesResponse.data.stories.forEach(story => {
          console.log(`  - ${story.title}`);
        });
      } else {
        console.log('❌ Failed to get pending stories:', pendingStoriesResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error getting pending stories:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }

    // 4. Test getting approved stories (public endpoint)
    console.log('\n4️⃣ Testing GET /api/traveler-stories (public)...');
    try {
      const publicStoriesResponse = await axios.get(`${API_URL}/traveler-stories`);

      console.log('Response status:', publicStoriesResponse.status);
      
      if (publicStoriesResponse.data.success) {
        console.log(`✅ Found ${publicStoriesResponse.data.stories.length} approved stories`);
        publicStoriesResponse.data.stories.forEach(story => {
          console.log(`  - ${story.title}`);
        });
      } else {
        console.log('❌ Failed to get public stories:', publicStoriesResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error getting public stories:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }

    console.log('\n✅ API test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Backend server is not running!');
      console.error('   Please start the backend server first: npm start');
    }
  }
}

testStoriesAPI();
