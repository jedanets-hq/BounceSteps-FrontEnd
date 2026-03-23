const fetch = require('node-fetch');

async function testFollowersAPI() {
  try {
    console.log('🔍 Testing followers API...\n');
    
    // First, login as a service provider
    console.log('1️⃣ Logging in as service provider...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'dantest1@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User ID:', loginData.user.id);
    console.log('User Type:', loginData.user.userType);
    console.log('Token:', loginData.token.substring(0, 20) + '...');
    
    // Now fetch followers
    console.log('\n2️⃣ Fetching followers...');
    const followersResponse = await fetch('http://localhost:5000/api/providers/my-followers', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const followersData = await followersResponse.json();
    
    console.log('Response:', followersData);
    
    if (followersData.success) {
      console.log(`\n✅ Found ${followersData.count} followers:`);
      followersData.followers.forEach(f => {
        console.log(`  - ${f.first_name} ${f.last_name} (${f.email})`);
        console.log(`    Followed at: ${f.followed_at}`);
      });
    } else {
      console.log('❌ Failed to fetch followers:', followersData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testFollowersAPI();
