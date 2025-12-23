require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./config/postgresql');

async function check() {
  try {
    console.log('🔍 Checking for MBEYA services...\n');
    
    // Check all services with MBEYA in any location field
    const result = await pool.query(`
      SELECT id, title, location, region, district, area, category
      FROM services 
      WHERE LOWER(location) LIKE '%mbeya%' 
         OR LOWER(region) LIKE '%mbeya%'
         OR LOWER(district) LIKE '%mbeya%'
         OR LOWER(area) LIKE '%mbeya%'
    `);
    
    console.log('Services with MBEYA:', result.rows.length);
    result.rows.forEach(s => console.log(s));
    
    // Also check provider profiles
    const providers = await pool.query(`
      SELECT id, business_name, location, region, district
      FROM service_providers 
      WHERE LOWER(location) LIKE '%mbeya%' 
         OR LOWER(region) LIKE '%mbeya%'
         OR LOWER(district) LIKE '%mbeya%'
    `);
    
    console.log('\nProviders with MBEYA:', providers.rows.length);
    providers.rows.forEach(p => console.log(p));
    
    // Check all services to see what locations exist
    const allServices = await pool.query(`
      SELECT DISTINCT region FROM services WHERE region IS NOT NULL ORDER BY region
    `);
    console.log('\nAll regions in services:', allServices.rows.map(r => r.region));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
