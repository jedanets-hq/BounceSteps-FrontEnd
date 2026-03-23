// Test provider #2 which should have services

async function testProvider2() {
  try {
    console.log('🔍 Testing Provider #2 (Updated Business Name)\n');
    
    const response = await fetch('http://localhost:5000/api/providers/2');
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success && data.provider) {
      console.log(`\nProvider: ${data.provider.business_name}`);
      console.log(`Provider ID: ${data.provider.id}`);
      console.log(`User ID: ${data.provider.user_id}`);
      console.log(`Services count: ${data.provider.services?.length || 0}`);
      
      if (data.provider.services && data.provider.services.length > 0) {
        console.log('\n✅ SERVICES FOUND:');
        data.provider.services.forEach(s => {
          console.log(`  - ${s.title} (ID: ${s.id})`);
        });
      } else {
        console.log('\n❌ NO SERVICES');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testProvider2();
