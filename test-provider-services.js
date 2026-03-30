// Check which services belong to which providers

async function checkProviderServices() {
  try {
    console.log('🔍 CHECKING PROVIDER-SERVICE RELATIONSHIPS\n');
    
    // Get all services
    const servicesRes = await fetch('http://localhost:5000/api/services?limit=100');
    const servicesData = await servicesRes.json();
    
    // Get all providers
    const providersRes = await fetch('http://localhost:5000/api/providers');
    const providersData = await providersRes.json();
    
    console.log(`Found ${servicesData.services.length} services`);
    console.log(`Found ${providersData.providers.length} providers\n`);
    
    // Group services by provider_id
    const servicesByProvider = {};
    servicesData.services.forEach(s => {
      if (!servicesByProvider[s.provider_id]) {
        servicesByProvider[s.provider_id] = [];
      }
      servicesByProvider[s.provider_id].push(s);
    });
    
    console.log('📊 Services grouped by provider_id:\n');
    Object.keys(servicesByProvider).forEach(providerId => {
      const services = servicesByProvider[providerId];
      console.log(`Provider ID ${providerId}:`);
      services.forEach(s => {
        console.log(`  - Service #${s.id}: ${s.title}`);
        console.log(`    business_name from JOIN: ${s.business_name}`);
      });
      console.log('');
    });
    
    console.log('\n📊 Checking each provider:\n');
    for (const provider of providersData.providers) {
      console.log(`Provider #${provider.id}: ${provider.business_name} (user_id: ${provider.user_id})`);
      
      const servicesForThisProvider = servicesByProvider[provider.id] || [];
      const servicesForUserId = servicesByProvider[provider.user_id] || [];
      
      console.log(`  Services with provider_id = ${provider.id}: ${servicesForThisProvider.length}`);
      console.log(`  Services with provider_id = ${provider.user_id} (user_id): ${servicesForUserId.length}`);
      
      if (servicesForUserId.length > 0 && servicesForThisProvider.length === 0) {
        console.log(`  ❌ MISMATCH! Services are using user_id instead of service_providers.id`);
        console.log(`  FIX NEEDED: Update services to use provider_id = ${provider.id}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProviderServices();
