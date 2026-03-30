const fetch = require('node-fetch');

async function checkData() {
  console.log('🔍 Checking users and services data...\n');
  
  try {
    // Get services
    const servicesResponse = await fetch('http://localhost:5000/api/services?limit=5');
    const servicesData = await servicesResponse.json();
    
    console.log('📦 Services:');
    servicesData.services.forEach(s => {
      console.log(`   - Service ${s.id}: ${s.title}`);
      console.log(`     provider_id: ${s.provider_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
