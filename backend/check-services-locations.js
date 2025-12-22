require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./config/postgresql');

async function checkServicesLocations() {
  try {
    console.log('🔍 CHECKING ALL SERVICES WITH LOCATIONS...\n');
    
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.location,
        s.region,
        s.district,
        s.area,
        s.country,
        sp.location as provider_location,
        sp.region as provider_region,
        sp.district as provider_district
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.category, s.id
    `);
    
    console.log(`Found ${result.rows.length} services:\n`);
    
    // Group by category
    const byCategory = {};
    result.rows.forEach(service => {
      if (!byCategory[service.category]) {
        byCategory[service.category] = [];
      }
      byCategory[service.category].push(service);
    });
    
    // Display by category
    Object.keys(byCategory).forEach(category => {
      console.log(`\n📦 ${category} (${byCategory[category].length} services):`);
      console.log('─'.repeat(80));
      
      byCategory[category].forEach(service => {
        console.log(`\n  ID: ${service.id} | ${service.title}`);
        console.log(`  Service Location: ${service.location || 'NULL'}`);
        console.log(`  Service Region: ${service.region || 'NULL'}`);
        console.log(`  Service District: ${service.district || 'NULL'}`);
        console.log(`  Service Area: ${service.area || 'NULL'}`);
        console.log(`  Service Country: ${service.country || 'NULL'}`);
        console.log(`  Provider Location: ${service.provider_location || 'NULL'}`);
        console.log(`  Provider Region: ${service.provider_region || 'NULL'}`);
        console.log(`  Provider District: ${service.provider_district || 'NULL'}`);
      });
    });
    
    console.log('\n\n✅ DONE!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkServicesLocations();
