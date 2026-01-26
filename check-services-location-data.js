require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  try {
    console.log('🔍 Checking services location data...\n');
    
    // Check services in Mwanza region
    const mwanzaServices = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services 
      WHERE LOWER(region) = 'mwanza'
      ORDER BY district, area
      LIMIT 20
    `);
    
    console.log(`📦 Services in Mwanza region: ${mwanzaServices.rows.length}`);
    mwanzaServices.rows.forEach(s => {
      console.log(`  - ${s.title} (${s.category})`);
      console.log(`    Location: ${s.region} > ${s.district} > ${s.area}`);
      console.log(`    Provider ID: ${s.provider_id}\n`);
    });
    
    // Check services in Ilemela district
    const ilemelaServices = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services 
      WHERE LOWER(district) = 'ilemela'
      ORDER BY area
      LIMIT 20
    `);
    
    console.log(`\n📦 Services in Ilemela district: ${ilemelaServices.rows.length}`);
    ilemelaServices.rows.forEach(s => {
      console.log(`  - ${s.title} (${s.category})`);
      console.log(`    Location: ${s.region} > ${s.district} > ${s.area}`);
      console.log(`    Provider ID: ${s.provider_id}\n`);
    });
    
    // Check services in Buzuruga area
    const buzurugaServices = await pool.query(`
      SELECT id, title, category, region, district, area, provider_id
      FROM services 
      WHERE LOWER(area) LIKE 'buzuruga%'
      ORDER BY area
      LIMIT 20
    `);
    
    console.log(`\n📦 Services in Buzuruga area: ${buzurugaServices.rows.length}`);
    buzurugaServices.rows.forEach(s => {
      console.log(`  - ${s.title} (${s.category})`);
      console.log(`    Location: ${s.region} > ${s.district} > ${s.area}`);
      console.log(`    Provider ID: ${s.provider_id}\n`);
    });
    
    // Check all unique locations
    const uniqueLocations = await pool.query(`
      SELECT DISTINCT region, district, area, COUNT(*) as service_count
      FROM services
      WHERE region IS NOT NULL AND region != ''
      GROUP BY region, district, area
      ORDER BY region, district, area
    `);
    
    console.log(`\n📍 All unique service locations (${uniqueLocations.rows.length}):`);
    uniqueLocations.rows.forEach(loc => {
      console.log(`  ${loc.region} > ${loc.district} > ${loc.area} (${loc.service_count} services)`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
