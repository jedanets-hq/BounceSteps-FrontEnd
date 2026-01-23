require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAllServices() {
  try {
    console.log('🔍 Checking ALL services in database...\n');
    
    const allServices = await pool.query(`
      SELECT 
        id, 
        title, 
        category,
        region, 
        district, 
        area,
        location,
        status,
        is_active
      FROM services 
      WHERE status = 'active' AND is_active = true
      ORDER BY region, district, area
      LIMIT 50
    `);
    
    console.log(`📊 Total active services: ${allServices.rows.length}\n`);
    
    if (allServices.rows.length > 0) {
      allServices.rows.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Region: ${service.region || 'NULL'}`);
        console.log(`   District: ${service.district || 'NULL'}`);
        console.log(`   Area: ${service.area || 'NULL'}`);
        console.log(`   Location: ${service.location || 'NULL'}`);
        console.log('');
      });
      
      // Show unique regions
      const regions = [...new Set(allServices.rows.map(s => s.region).filter(Boolean))];
      console.log(`\n📍 Available Regions: ${regions.join(', ') || 'NONE'}`);
      
      // Show unique categories
      const categories = [...new Set(allServices.rows.map(s => s.category).filter(Boolean))];
      console.log(`\n🏷️ Available Categories: ${categories.join(', ') || 'NONE'}`);
      
    } else {
      console.log('❌ No active services found in database!');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllServices();
