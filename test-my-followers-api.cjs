const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testMyFollowersAPI() {
  try {
    console.log('🧪 Testing /api/providers/my-followers endpoint\n');
    
    // First, login as provider (user 8 - mfungo@gmail.com)
    console.log('1️⃣ Logging in as provider...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mfungo@gmail.com',
        password: 'Test@123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      console.log('   Trying with different password...');
      
      // Try with another password
      const loginResponse2 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mfungo@gmail.com',
          password: 'Mfungo@123'
        })
      });
      
      const loginData2 = await loginResponse2.json();
      
      if (!loginData2.success) {
        console.log('❌ Login failed again:', loginData2.message);
        return;
      }
      
      console.log('✅ Logged in as:', loginData2.user.email);
      console.log('   User ID:', loginData2.user.id);
      console.log('   User Type:', loginData2.user.user_type);
      
      const token = loginData2.token;
      
      // Test my-followers endpoint
      console.log('\n2️⃣ Testing /api/providers/my-followers...');
      const followersResponse = await fetch(`${API_URL}/providers/my-followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const followersData = await followersResponse.json();
      
      console.log('   Response:', JSON.stringify(followersData, null, 2));
      
      if (followersData.success) {
        console.log('\n✅ Followers count:', followersData.count);
        if (followersData.followers.length > 0) {
          console.log('   Followers:');
          followersData.followers.forEach(f => {
            console.log(`   - ${f.first_name} ${f.last_name} (${f.email})`);
          });
        }
      } else {
        console.log('❌ Failed:', followersData.message);
      }
      
      return;
    }
    
    console.log('✅ Logged in as:', loginData.user.email);
    console.log('   User ID:', loginData.user.id);
    console.log('   User Type:', loginData.user.user_type);
    
    const token = loginData.token;
    
    // Test my-followers endpoint
    console.log('\n2️⃣ Testing /api/providers/my-followers...');
    const followersResponse = await fetch(`${API_URL}/providers/my-followers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const followersData = await followersResponse.json();
    
    console.log('   Response:', JSON.stringify(followersData, null, 2));
    
    if (followersData.success) {
      console.log('\n✅ Followers count:', followersData.count);
      if (followersData.followers.length > 0) {
        console.log('   Followers:');
        followersData.followers.forEach(f => {
          console.log(`   - ${f.first_name} ${f.last_name} (${f.email})`);
        });
      }
    } else {
      console.log('❌ Failed:', followersData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMyFollowersAPI();
