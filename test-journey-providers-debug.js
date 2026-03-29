// Test script to debug Journey Planner providers issue
const API_URL = 'https://bouncesteps-backend.onrender.com/api';

async function testProvidersEndpoint() {
  console.log('🔍 Testing Journey Planner Providers Endpoint...\n');
  
  try {
    // Test 1: Fetch all services
    console.log('📡 Test 1: Fetching all services...');
    const response = await fetch(`${API_URL}/services?limit=500`);
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ API returned error:', data.message);
      return;
    }
    
    console.log(`✅ Total services in database: ${data.services?.length || 0}`);
    
    if (!data.services || data.services.length === 0) {
      console.log('⚠️ No services found in database!');
      return;
    }
    
    // Test 2: Check service structure
    console.log('\n📋 Sample service structure:');
    const sampleService = data.services[0];
    console.log({
      id: sampleService.id,
      title: sampleService.title,
      category: sampleService.category,
      provider_id: sampleService.provider_id,
      business_name: sampleService.business_name,
      region: sampleService.region,
      district: sampleService.district,
      area: sampleService.area,
      price: sampleService.price
    });
    
    // Test 3: Group by region
    console.log('\n📍 Services by Region:');
    const byRegion = {};
    data.services.forEach(service => {
      const region = service.region || 'Unknown';
      if (!byRegion[region]) byRegion[region] = 0;
      byRegion[region]++;
    });
    Object.entries(byRegion).forEach(([region, count]) => {
      console.log(`   ${region}: ${count} services`);
    });
    
    // Test 4: Group by category
    console.log('\n🏷️ Services by Category:');
    const byCategory = {};
    data.services.forEach(service => {
      const category = service.category || 'Unknown';
      if (!byCategory[category]) byCategory[category] = 0;
      byCategory[category]++;
    });
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} services`);
    });
    
    // Test 5: Simulate Journey Planner filtering
    console.log('\n🔍 Simulating Journey Planner Filter:');
    const testLocation = {
      region: 'Mbeya',
      district: 'Mbeya CBD',
      ward: ''
    };
    const testServices = ['Accommodation', 'Transportation'];
    
    console.log(`   Location: ${testLocation.region} > ${testLocation.district}`);
    console.log(`   Services: ${testServices.join(', ')}`);
    
    const normalize = (str) => (str || '').toLowerCase().trim();
    
    let filtered = data.services.filter(service => {
      const serviceRegion = normalize(service.region);
      const serviceDistrict = normalize(service.district);
      const serviceArea = normalize(service.area);
      const searchRegion = normalize(testLocation.region);
      const searchDistrict = normalize(testLocation.district);
      
      // Region must match
      if (searchRegion && serviceRegion !== searchRegion) return false;
      
      // District matching
      if (searchDistrict) {
        const districtMatch = serviceDistrict === searchDistrict || serviceArea === searchDistrict;
        const isRegionLevel = !serviceDistrict && !serviceArea;
        if (!districtMatch && !isRegionLevel) return false;
      }
      
      return true;
    });
    
    console.log(`   ✅ After location filter: ${filtered.length} services`);
    
    // Category filter
    filtered = filtered.filter(service => {
      const serviceCategory = normalize(service.category);
      return testServices.map(normalize).includes(serviceCategory);
    });
    
    console.log(`   ✅ After category filter: ${filtered.length} services`);
    
    // Group by provider
    const providerMap = new Map();
    filtered.forEach(service => {
      const providerId = service.provider_id;
      if (!providerId) return;
      
      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          id: providerId,
          business_name: service.business_name || 'Service Provider',
          services: [service],
          services_count: 1
        });
      } else {
        const provider = providerMap.get(providerId);
        provider.services.push(service);
        provider.services_count++;
      }
    });
    
    const providers = Array.from(providerMap.values());
    console.log(`   ✅ Final providers: ${providers.length}`);
    
    if (providers.length > 0) {
      console.log('\n📋 Sample providers:');
      providers.slice(0, 3).forEach(p => {
        console.log(`   - ${p.business_name} (${p.services_count} services)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProvidersEndpoint();
