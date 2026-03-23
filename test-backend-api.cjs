const fetch = require('node-fetch');

async function testBackendAPI() {
  try {
    console.log('🔍 Testing backend API...\n');
    
    // Test 1: Get all providers
    console.log('1️⃣ Testing GET /api/providers');
    const providersResponse = await fetch('http://localhost:5000/api/providers');
    const providersData = await providersResponse.json();
    console.log('   Status:', providersResponse.status);
    console.log('   Success:', providersData.success);
    console.log('   Providers count:', providersData.providers?.length || 0);
    if (providersData.providers?.length > 0) {
      console.log('   First provider:', providersData.providers[0].business_name);
    }
    
    // Test 2: Get provider by ID
    console.log('\n2️⃣ Testing GET /api/providers/1');
    const providerResponse = await fetch('http://localhost:5000/api/providers/1');
    const providerData = await providerResponse.json();
    console.log('   Status:', providerResponse.status);
    console.log('   Success:', providerData.success);
    if (providerData.provider) {
      console.log('   Provider:', providerData.provider.business_name);
      console.log('   Services count:', providerData.provider.services?.length || 0);
    }
    
    // Test 3: Get all services
    console.log('\n3️⃣ Testing GET /api/services');
    const servicesResponse = await fetch('http://localhost:5000/api/services?limit=100');
    const servicesData = await servicesResponse.json();
    console.log('   Status:', servicesResponse.status);
    console.log('   Success:', servicesData.success);
    console.log('   Services count:', servicesData.services?.length || 0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBackendAPI();
