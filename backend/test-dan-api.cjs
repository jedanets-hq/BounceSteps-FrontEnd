const fetch = require('node-fetch');

async function testDanAPI() {
  console.log('\n=== TESTING DAN PROVIDER API ===\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // 1. Test GET /api/providers (should return all providers)
    console.log('1. Testing GET /api/providers:');
    const providersResponse = await fetch(`${baseURL}/providers`);
    const providersData = await providersResponse.json();
    console.log('Status:', providersResponse.status);
    console.log('Success:', providersData.success);
    console.log('Providers count:', providersData.providers?.length);
    
    // Find Dan's providers
    const danProviders = providersData.providers?.filter(p => 
      p.business_name?.toLowerCase().includes('dan') || 
      p.business_name?.toLowerCase().includes('shop') ||
      p.id === 2 || p.id === 5
    );
    console.log('\nDan providers found:', danProviders?.length);
    danProviders?.forEach(p => {
      console.log(`  - ID: ${p.id}, Name: ${p.business_name}, User ID: ${p.user_id}`);
    });
    
    // 2. Test GET /api/providers/2 (Dan's first provider)
    console.log('\n2. Testing GET /api/providers/2:');
    const provider2Response = await fetch(`${baseURL}/providers/2`);
    const provider2Data = await provider2Response.json();
    console.log('Status:', provider2Response.status);
    console.log('Success:', provider2Data.success);
    if (provider2Data.success) {
      console.log('Provider:', {
        id: provider2Data.provider.id,
        business_name: provider2Data.provider.business_name,
        user_id: provider2Data.provider.user_id,
        services_count: provider2Data.provider.services?.length || 0
      });
      console.log('Services:', provider2Data.provider.services?.map(s => s.title));
    } else {
      console.log('Error:', provider2Data.message);
    }
    
    // 3. Test GET /api/providers/5 (Dan's second provider)
    console.log('\n3. Testing GET /api/providers/5:');
    const provider5Response = await fetch(`${baseURL}/providers/5`);
    const provider5Data = await provider5Response.json();
    console.log('Status:', provider5Response.status);
    console.log('Success:', provider5Data.success);
    if (provider5Data.success) {
      console.log('Provider:', {
        id: provider5Data.provider.id,
        business_name: provider5Data.provider.business_name,
        user_id: provider5Data.provider.user_id,
        services_count: provider5Data.provider.services?.length || 0
      });
      console.log('Services:', provider5Data.provider.services?.map(s => s.title));
    } else {
      console.log('Error:', provider5Data.message);
    }
    
    // 4. Test GET /api/services (should return all services)
    console.log('\n4. Testing GET /api/services:');
    const servicesResponse = await fetch(`${baseURL}/services`);
    const servicesData = await servicesResponse.json();
    console.log('Status:', servicesResponse.status);
    console.log('Success:', servicesData.success);
    console.log('Services count:', servicesData.services?.length);
    
    // Find Dan's services
    const danServices = servicesData.services?.filter(s => 
      s.provider_id === 2 || s.provider_id === 5
    );
    console.log('\nDan services found:', danServices?.length);
    danServices?.forEach(s => {
      console.log(`  - ID: ${s.id}, Title: ${s.title}, Provider ID: ${s.provider_id}`);
    });
    
    console.log('\n=== TEST COMPLETE ===\n');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDanAPI();
