const fetch = require('node-fetch');

async function checkData() {
  console.log('🔍 Checking data via API...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/fix/check-data');
    const data = await response.json();
    
    console.log('📦 Services:');
    data.services.forEach(s => {
      console.log(`   - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
    });
    
    console.log('\n👤 Users:');
    data.users.forEach(u => {
      console.log(`   - User ${u.id}: ${u.email} (${u.role})`);
    });
    
    console.log('\n👥 Service Providers:');
    data.providers.forEach(p => {
      console.log(`   - Provider ${p.id}: ${p.business_name} (user_id: ${p.user_id})`);
    });
    
    console.log('\n🔍 Analysis:');
    data.services.forEach(s => {
      const user = data.users.find(u => u.id === s.provider_id);
      const provider = data.providers.find(p => p.user_id === s.provider_id);
      
      console.log(`\nService "${s.title}" (provider_id: ${s.provider_id}):`);
      console.log(`   User exists: ${user ? 'YES' : 'NO'}`);
      console.log(`   Provider record exists: ${provider ? 'YES' : 'NO'}`);
      
      if (user && !provider) {
        console.log(`   ⚠️  MISSING: Need to create service_provider for user ${user.id}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkData();
