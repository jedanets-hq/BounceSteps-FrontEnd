require('dotenv').config();
const { Pool } = require('pg');

// Use production database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkMbeyaCBDServices() {
  try {
    console.log('🔍 Checking services in MBEYA region...\n');
    
    // Check all services in MBEYA region
    const mbeyaServices = await pool.query(`
      SELECT 
        id, 
        title, 
        category,
        region, 
        district, 
        area,
        location,
        provider_id,
        status,
        is_active
      FROM services 
      WHERE LOWER(region) LIKE '%mbeya%'
      ORDER BY region, district, area
    `);
    
    console.log(`📊 Found ${mbeyaServices.rows.length} services in MBEYA region:\n`);
    
    if (mbeyaServices.rows.length > 0) {
      mbeyaServices.rows.forEach((service, index) => {
        console.log(`${index + 1}. ${service.title}`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Region: ${service.region}`);
        console.log(`   District: ${service.district || 'NULL'}`);
        console.log(`   Area: ${service.area || 'NULL'}`);
        console.log(`   Location: ${service.location || 'NULL'}`);
        console.log(`   Status: ${service.status}, Active: ${service.is_active}`);
        console.log('');
      });
      
      // Check for "MBEYA CBD" specifically
      const cbdServices = mbeyaServices.rows.filter(s => 
        (s.district && s.district.toLowerCase().includes('cbd')) ||
        (s.area && s.area.toLowerCase().includes('cbd')) ||
        (s.location && s.location.toLowerCase().includes('cbd'))
      );
      
      console.log(`\n🏙️ Services with "CBD" in location: ${cbdServices.length}`);
      if (cbdServices.length > 0) {
        cbdServices.forEach(s => {
          console.log(`   - ${s.title}: district="${s.district}", area="${s.area}"`);
        });
      }
      
      // Show unique districts and areas
      const districts = [...new Set(mbeyaServices.rows.map(s => s.district).filter(Boolean))];
      const areas = [...new Set(mbeyaServices.rows.map(s => s.area).filter(Boolean))];
      
      console.log(`\n📍 Unique Districts in MBEYA: ${districts.join(', ') || 'NONE'}`);
      console.log(`\n📍 Unique Areas in MBEYA: ${areas.join(', ') || 'NONE'}`);
      
    } else {
      console.log('❌ No services found in MBEYA region!');
    }
    
    // Check IYUNGA specifically
    console.log('\n\n🔍 Checking for IYUNGA location...\n');
    const iyungaServices = await pool.query(`
      SELECT 
        id, 
        title, 
        category,
        region, 
        district, 
        area,
        location
      FROM services 
      WHERE LOWER(district) LIKE '%iyunga%' 
         OR LOWER(area) LIKE '%iyunga%'
         OR LOWER(location) LIKE '%iyunga%'
    `);
    
    console.log(`📊 Services with IYUNGA: ${iyungaServices.rows.length}`);
    if (iyungaServices.rows.length > 0) {
      iyungaServices.rows.forEach(s => {
        console.log(`   - ${s.title}: ${s.region} → ${s.district} → ${s.area}`);
      });
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMbeyaCBDServices();
