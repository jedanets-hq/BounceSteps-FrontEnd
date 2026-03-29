const fetch = require('node-fetch');

async function testProviderFix() {
  try {
    console.log('🧪 Testing Provider Fix...\n');
    
    // Test 1: Get all services to see provider_id
    console.log('1️⃣ Fetching services to get provider IDs...');
    const servicesResponse = await fetch('http://localhost:5000/api/services?limit=5');
    const servicesData = await servicesResponse.json();
    
    if (servicesData.success && servicesData.services.length > 0) {
      const firstService = servicesData.services[0];
      console.log(`✅ Found ${servicesData.services.length} services`);
      console.log(`   First service: ${firstService.title}`);
      console.log(`   provider_id (sp.id): ${firstService.provider_id}`);
      console.log(`   provider_user_id (user_id): ${firstService.provider_user_id || 'NOT AVAILABLE'}`);
      console.log('');
      
      // Test 2: Try to fetch provider using provider_id (service_providers.id)
      console.log(`2️⃣ Fetching provider using provider_id (${firstService.provider_id})...`);
      const providerResponse1 = await fetch(`http://localhost:5000/api/providers/${firstService.provider_id}`);
      const providerData1 = await providerResponse1.json();
      
      if (providerData1.success) {
        console.log(`✅ SUCCESS! Provider found: ${providerData1.provider.business_name}`);
        console.log(`   Services count: ${providerData1.provider.services_count}`);
      } else {
        console.log(`❌ FAILED! ${providerData1.message}`);
      }
      console.log('');
      
      // Test 3: Try to fetch provider using provider_user_id if available
      if (firstService.provider_user_id) {
        console.log(`3️⃣ Fetching provider using provider_user_id (${firstService.provider_user_id})...`);
        const providerResponse2 = await fetch(`http://localhost:5000/api/providers/${firstService.provider_user_id}`);
        const providerData2 = await providerResponse2.json();
        
        if (providerData2.success) {
          console.log(`✅ SUCCESS! Provider found: ${providerData2.provider.business_name}`);
          console.log(`   Services count: ${providerData2.provider.services_count}`);
        } else {
          console.log(`❌ FAILED! ${providerData2.message}`);
        }
      }
      
      console.log('\n📊 SUMMARY:');
      console.log('   The fix allows fetching providers using EITHER:');
      console.log('   - service_providers.id (provider_id from services)');
      console.log('   - users.id (provider_user_id / user_id)');
      console.log('   This ensures frontend can navigate to provider profiles correctly!');
      
    } else {
      console.log('❌ No services found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProviderFix();
