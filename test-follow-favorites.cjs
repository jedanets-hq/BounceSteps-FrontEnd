const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:5000/api';

async function testFollowAndFavorites() {
  try {
    console.log('🧪 Testing Follow and Favorites Functionality\n');

    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@test.com',
        password: 'test123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success || !loginData.token) {
      console.log('❌ Login failed, trying testprovider@example.com...');
      const loginResponse2 = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testprovider@example.com',
          password: 'password123'
        })
      });
      const loginData2 = await loginResponse2.json();
      if (!loginData2.success) {
        console.log('❌ Both logins failed');
        return;
      }
      var token = loginData2.token;
    } else {
      var token = loginData.token;
    }
    
    console.log('✅ Logged in successfully\n');

    // 2. Test Follow
    console.log('2️⃣ Testing Follow Provider (ID: 1)...');
    const followResponse = await fetch(`${API_BASE_URL}/providers/1/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const followData = await followResponse.json();
    console.log('Follow response:', followData);
    console.log('Status:', followResponse.status);
    
    if (followData.success) {
      console.log('✅ Follow successful');
    } else {
      console.log('❌ Follow failed:', followData.message);
    }
    console.log('');

    // 3. Test Favorites
    console.log('3️⃣ Testing Add to Favorites (Provider ID: 1)...');
    const favResponse = await fetch(`${API_BASE_URL}/favorites/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ providerId: 1 })
    });
    
    const favData = await favResponse.json();
    console.log('Favorites response:', favData);
    console.log('Status:', favResponse.status);
    
    if (favData.success) {
      console.log('✅ Add to favorites successful');
    } else {
      console.log('❌ Add to favorites failed:', favData.message);
    }
    console.log('');

    // 4. Get follower count
    console.log('4️⃣ Getting follower count...');
    const countResponse = await fetch(`${API_BASE_URL}/providers/1/followers/count`);
    const countData = await countResponse.json();
    console.log('Follower count:', countData);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFollowAndFavorites();
