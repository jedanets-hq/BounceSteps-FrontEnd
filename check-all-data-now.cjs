const http = require('http');

async function checkAllData() {
  console.log('🔍 Checking ALL data in database...\n');
  
  // Check services
  const servicesReq = new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
  
  // Check providers
  const providersReq = new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/providers',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
  
  try {
    const [servicesData, providersData] = await Promise.all([servicesReq, providersReq]);
    
    console.log('📦 SERVICES:');
    console.log('─'.repeat(80));
    if (servicesData.success && servicesData.services) {
      console.log(`Total: ${servicesData.services.length} services\n`);
      servicesData.services.forEach(s => {
        console.log(`ID: ${s.id}`);
        console.log(`  Title: ${s.title}`);
        console.log(`  Category: ${s.category}`);
        console.log(`  Provider ID: ${s.provider_id}`);
        console.log(`  Price: ${s.price}`);
        console.log(`  Location: ${s.location}`);
        console.log('');
      });
    } else {
      console.log('❌ No services found or error:', servicesData.message);
    }
    
    console.log('\n👥 PROVIDERS:');
    console.log('─'.repeat(80));
    if (providersData.success && providersData.providers) {
      console.log(`Total: ${providersData.providers.length} providers\n`);
      providersData.providers.forEach(p => {
        console.log(`ID: ${p.id}`);
        console.log(`  Business Name: ${p.business_name}`);
        console.log(`  Email: ${p.email}`);
        console.log(`  Rating: ${p.rating}`);
        console.log('');
      });
    } else {
      console.log('❌ No providers found or error:', providersData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllData();
