// Test the live API to see what's actually happening

async function testAPI() {
  try {
    console.log('🔍 TESTING LIVE API\n');
    
    // 1. Test GET /api/services
    console.log('1️⃣ Testing GET /api/services...');
    const servicesRes = await fetch('http://localhost:5000/api/services?limit=100');
    const servicesData = await servicesRes.json();
    console.log(`   Status: ${servicesRes.status}`);
    console.log(`   Services found: ${servicesData.services?.length || 0}`);
    
    if (servicesData.services && servicesData.services.length > 0) {
      console.log('\n   Sample service:');
      const sample = servicesData.services[0];
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Title: ${sample.title}`);
      console.log(`   - provider_id: ${sample.provider_id}`);
      console.log(`   - service_provider_id: ${sample.service_provider_id}`);
      console.log(`   - business_name: ${sample.business_name}`);
    }
    
    // 2. Test GET /api/providers
    console.log('\n2️⃣ Testing GET /api/providers...');
    const providersRes = await fetch('http://localhost:5000/api/providers');
    const providersData = await providersRes.json();
    console.log(`   Status: ${providersRes.status}`);
    console.log(`   Providers found: ${providersData.providers?.length || 0}`);
    
    if (providersData.providers && providersData.providers.length > 0) {
      console.log('\n   Sample provider:');
      const sample = providersData.providers[0];
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - user_id: ${sample.user_id}`);
      console.log(`   - business_name: ${sample.business_name}`);
      
      // 3. Test GET /api/providers/:id
      console.log(`\n3️⃣ Testing GET /api/providers/${sample.id}...`);
      const providerRes = await fetch(`http://localhost:5000/api/providers/${sample.id}`);
      const providerData = await providerRes.json();
      console.log(`   Status: ${providerRes.status}`);
      console.log(`   Success: ${providerData.success}`);
      
      if (providerData.success && providerData.provider) {
        console.log(`   Provider: ${providerData.provider.business_name}`);
        console.log(`   Services count: ${providerData.provider.services?.length || 0}`);
        
        if (providerData.provider.services && providerData.provider.services.length > 0) {
          console.log('\n   ✅ Services ARE being returned!');
          providerData.provider.services.forEach(s => {
            console.log(`      - ${s.title}`);
          });
        } else {
          console.log('\n   ❌ NO SERVICES returned for this provider!');
          console.log(`   Provider ID: ${providerData.provider.id}`);
          console.log(`   User ID: ${providerData.provider.user_id}`);
        }
      } else {
        console.log(`   ❌ Error: ${providerData.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
