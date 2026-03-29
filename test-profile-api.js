import fetch from 'node-fetch';

async function testProfileAPI() {
  try {
    console.log('🔐 Testing login...\n');
    
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jedanetworksglobalhq@gmail.com',
        password: '@Jctnftr01'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('Token:', loginData.token.substring(0, 20) + '...');
    console.log('\n');
    
    // Get profile
    console.log('📥 Fetching profile...\n');
    
    const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const profileData = await profileResponse.json();
    
    if (!profileData.success) {
      console.log('❌ Profile fetch failed:', profileData.message);
      return;
    }
    
    console.log('✅ Profile fetched successfully\n');
    console.log('=== USER DATA ===');
    console.log(JSON.stringify(profileData.user, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProfileAPI();
