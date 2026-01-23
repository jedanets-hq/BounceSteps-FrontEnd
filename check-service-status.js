require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkServiceStatus() {
  try {
    console.log('🔍 Checking service status...\n');
    
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        category,
        region, 
        district, 
        area,
        location,
        status,
        is_active,
        provider_id
      FROM services 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`📊 Total services: ${result.rows.length}\n`);
    
    result.rows.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title}`);
      console.log(`   ID: ${service.id}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Region: ${service.region || 'NULL'}`);
      console.log(`   District: ${service.district || 'NULL'}`);
      console.log(`   Area: ${service.area || 'NULL'}`);
      console.log(`   Location: ${service.location || 'NULL'}`);
      console.log(`   Status: ${service.status}`);
      console.log(`   Is Active: ${service.is_active}`);
      console.log(`   Provider ID: ${service.provider_id}`);
      console.log('');
    });
    
    // Now test the query with NULL handling
    console.log('\n🧪 Testing query with NULL handling...\n');
    const testResult = await pool.query(`
      SELECT id, title, region, district, area, status, is_active
      FROM services 
      WHERE status = 'active' AND is_active = true
      LIMIT 10
    `);
    
    console.log(`Active services: ${testResult.rows.length}`);
    testResult.rows.forEach(s => {
      console.log(`   - ${s.title}: region=${s.region || 'NULL'}, status=${s.status}, active=${s.is_active}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkServiceStatus();
