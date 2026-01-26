const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testPartialAreaMatch() {
  try {
    console.log('🧪 TESTING PARTIAL AREA MATCHING FIX\n');
    
    // Simulate what backend API does now with LIKE
    console.log('TEST: MWANZA/ILEMELA/BUZURUGA with LIKE matching');
    
    const region = 'MWANZA';
    const district = 'ILEMELA';
    const area = 'BUZURUGA';
    
    let whereConditions = ["s.status = 'active'", "s.is_active = true"];
    let queryParams = [];
    let paramIndex = 1;
    
    if (region) {
      whereConditions.push(`LOWER(s.region) = LOWER($${paramIndex})`);
      queryParams.push(region);
      paramIndex++;
    }
    
    if (district) {
      whereConditions.push(`(LOWER(s.district) = LOWER($${paramIndex}) OR LOWER(s.area) LIKE LOWER($${paramIndex}))`);
      queryParams.push(district);
      paramIndex++;
    }
    
    if (area) {
      whereConditions.push(`LOWER(s.area) LIKE LOWER($${paramIndex})`);
      queryParams.push(`${area}%`); // Partial match
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const result = await pool.query(`
      SELECT s.*, 
             sp.business_name, 
             sp.location as provider_location
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      INNER JOIN users u ON s.provider_id = u.id
      WHERE ${whereClause}
      ORDER BY s.created_at DESC
    `, queryParams);
    
    console.log(`✅ Found ${result.rows.length} services:`);
    result.rows.forEach(s => {
      console.log(`  - ${s.title} by ${s.business_name}`);
      console.log(`    Location: ${s.region}/${s.district}/${s.area}`);
      console.log(`    Category: ${s.category}`);
    });
    
    if (result.rows.length > 0) {
      console.log('\n✅ SUCCESS! Partial area matching is working!');
      console.log('   "BUZURUGA" now matches "BUZURUGA KASKAZINI"');
    } else {
      console.log('\n❌ FAILED! No services found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testPartialAreaMatch();
