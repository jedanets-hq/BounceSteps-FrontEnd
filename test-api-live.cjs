const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('🧪 Testing Live API\n');
    
    // 1. Test provider endpoint with images
    console.log('1️⃣ Testing provider endpoint (ID: 1)...');
    const providerResponse = await fetch(`${API_URL}/providers/1`);
    const providerData = await providerResponse.json();
    
    if (providerData.success) {
      console.log('✅ Provider:', providerData.provider.business_name);
      console.log('   Services:', providerData.provider.services.length);
      
      providerData.provider.services.forEach((service, index) => {
        console.log(`\n   Service ${index + 1}: ${service.title}`);
        console.log(`   Images: ${JSON.stringify(service.images)}`);
        console.log(`   Images type: ${typeof service.images}`);
        console.log(`   Images is array: ${Array.isArray(service.images)}`);
      });
    } else {
      console.log('❌ Failed:', providerData.message);
    }
    
    // 2. Test follower count
    console.log('\n2️⃣ Testing follower count (Provider ID: 1)...');
    const followerResponse = await fetch(`${API_URL}/providers/1/followers/count`);
    const followerData = await followerResponse.json();
    
    if (followerData.success) {
      console.log('✅ Follower count:', followerData.count);
    } else {
      console.log('❌ Failed:', followerData.message);
    }
    
    console.log('\n✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
