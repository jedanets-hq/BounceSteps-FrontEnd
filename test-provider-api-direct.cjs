const fetch = require('node-fetch');

async function testProviderAPI() {
  console.log('🧪 Testing Provider API...\n');
  
  try {
    // Step 1: Get a service
    console.log('📡 Step 1: Fetching a service...');
    const serviceResponse = await fetch('http://localhost:5000/api/services?limit=1');
    const serviceData = await serviceResponse.json();
    
    if (!serviceData.success || !serviceData.services || serviceData.services.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    const service = serviceData.services[0];
    console.log(`✅ Service found: ${service.title}`);
    console.log(`   Provider ID: ${service.provider_id}`);
    console.log(`   Business Name: ${service.business_name}`);
    
    // Step 2: Try to get provider profile
    const providerId = service.provider_id;
    console.log(`\n📡 Step 2: Fetching provider profile for ID ${providerId}...`);
    
    const providerResponse = await fetch(`http://localhost:5000/api/providers/${providerId}`);
    const providerData = await providerResponse.json();
    
    console.log(`\n📊 Provider API Response:`);
    console.log(`   Status: ${providerResponse.status}`);
    console.log(`   Success: ${providerData.success}`);
    
    if (!providerData.success) {
      console.log(`   ❌ Error: ${providerData.message}`);
      console.log(`\n🔍 This means:`);
      console.log(`   - Service has provider_id = ${providerId}`);
      console.log(`   - But no service_provider record exists with user_id = ${providerId}`);
      console.log(`   - Need to create service_provider record for this user`);
    } else {
      console.log(`   ✅ Provider found: ${providerData.provider.business_name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProviderAPI();
