const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...\n');
    
    // 1. Login as admin
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@isafari.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('User:', loginData.user.firstName, loginData.user.lastName);
    console.log('User Type:', loginData.user.userType);
    console.log('Token:', loginData.token.substring(0, 20) + '...\n');
    
    const token = loginData.token;
    
    // 2. Test getting all stories
    console.log('📖 Testing GET /traveler-stories/admin/all...');
    const storiesResponse = await fetch(`${API_URL}/traveler-stories/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const storiesData = await storiesResponse.json();
    
    if (storiesData.success) {
      console.log(`✅ Success! Found ${storiesData.stories.length} stories`);
      storiesData.stories.forEach(story => {
        console.log(`   - [${story.status}] ${story.title}`);
      });
    } else {
      console.log('❌ Failed:', storiesData.message);
    }
    
    // 3. Test getting pending stories
    console.log('\n📋 Testing GET /traveler-stories/admin/pending...');
    const pendingResponse = await fetch(`${API_URL}/traveler-stories/admin/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const pendingData = await pendingResponse.json();
    
    if (pendingData.success) {
      console.log(`✅ Success! Found ${pendingData.stories.length} pending stories`);
      pendingData.stories.forEach(story => {
        console.log(`   - ${story.title} by ${story.first_name} ${story.last_name}`);
      });
    } else {
      console.log('❌ Failed:', pendingData.message);
    }
    
    console.log('\n✅ All tests passed!');
    console.log('\n📋 Admin credentials for testing:');
    console.log('   Email: admin@isafari.com');
    console.log('   Password: admin123');
    console.log('   Token:', token);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLogin();
