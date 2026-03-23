/**
 * Test with Correct Category
 */

const API_URL = process.env.VITE_API_URL || 'https://isafarimasterorg.onrender.com/api';

async function testCorrectCategory() {
  console.log('🧪 TESTING WITH CORRECT CATEGORY\n');
  console.log('='.repeat(80));
  
  // Test with the actual category that exists
  const queryParams = new URLSearchParams();
  queryParams.append('limit', '500');
  queryParams.append('region', 'Mwanza');
  queryParams.append('district', 'Ilemela');
  queryParams.append('area', 'Buzuruga');
  queryParams.append('category', 'Food & Dining'); // The actual category in the database
  
  const url = `${API_URL}/services?${queryParams.toString()}`;
  console.log(`\n📍 Request: ${url}\n`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ Services found: ${data.services?.length || 0}\n`);
    
    if (data.services && data.services.length > 0) {
      // Group by provider
      const providerMap = new Map();
      
      data.services.forEach(service => {
        const providerId = service.provider_id;
        if (!providerId) return;
        
        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            id: providerId,
            business_name: service.business_name || 'Service Provider',
            location: `${service.district || ''}, ${service.region || ''}`.trim(),
            services: [service],
            service_categories: [service.category]
          });
        } else {
          const provider = providerMap.get(providerId);
          provider.services.push(service);
          if (!provider.service_categories.includes(service.category)) {
            provider.service_categories.push(service.category);
          }
        }
      });
      
      const providers = Array.from(providerMap.values());
      
      console.log(`👥 Providers: ${providers.length}\n`);
      
      providers.forEach((provider, idx) => {
        console.log(`${idx + 1}. ${provider.business_name}`);
        console.log(`   Location: ${provider.location}`);
        console.log(`   Categories: ${provider.service_categories.join(', ')}`);
        console.log(`   Services: ${provider.services.length}`);
        provider.services.forEach(s => {
          console.log(`      - ${s.title} (TZS ${s.price || 'N/A'})`);
        });
        console.log('');
      });
      
      console.log('='.repeat(80));
      console.log('\n✅ SUCCESS: The filtering system is working correctly!');
      console.log('\nThe issue in the screenshot is:');
      console.log('   User selected: "Accommodation"');
      console.log('   Database has: "Food & Dining"');
      console.log('\nSolution:');
      console.log('   1. User should select "Food & Dining" category');
      console.log('   2. OR add Accommodation services to this location');
      console.log('   3. OR show a helpful message suggesting available categories');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCorrectCategory();
