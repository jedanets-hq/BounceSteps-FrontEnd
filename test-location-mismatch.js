const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testLocationMismatch() {
  try {
    console.log('🔍 TESTING LOCATION MISMATCH ISSUE\n');
    
    // Check what's in database
    console.log('DATABASE LOCATIONS:');
    const dbServices = await pool.query(`
      SELECT id, title, region, district, area, provider_id
      FROM services
      WHERE status = 'active' AND is_active = true
      ORDER BY created_at DESC
    `);
    
    dbServices.rows.forEach(s => {
      console.log(`  ${s.title}:`);
      console.log(`    Region: "${s.region}"`);
      console.log(`    District: "${s.district}"`);
      console.log(`    Area: "${s.area}"`);
      console.log('');
    });
    
    // Test exact match query (what backend does)
    console.log('\nTEST 1: Exact match - MWANZA/ILEMELA/BUZURUGA KASKAZINI');
    const test1 = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND LOWER(s.district) = LOWER($2)
        AND LOWER(s.area) = LOWER($3)
    `, ['MWANZA', 'ILEMELA', 'BUZURUGA KASKAZINI']);
    console.log(`  Result: ${test1.rows[0].count} services found`);
    
    // Test what frontend might send
    console.log('\nTEST 2: Frontend search - MWANZA/ILEMELA/BUZURUGA (without KASKAZINI)');
    const test2 = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND LOWER(s.district) = LOWER($2)
        AND LOWER(s.area) = LOWER($3)
    `, ['MWANZA', 'ILEMELA', 'BUZURUGA']);
    console.log(`  Result: ${test2.rows[0].count} services found`);
    
    // Test partial match with LIKE
    console.log('\nTEST 3: Partial match with LIKE - BUZURUGA%');
    const test3 = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND LOWER(s.district) = LOWER($2)
        AND LOWER(s.area) LIKE LOWER($3)
    `, ['MWANZA', 'ILEMELA', 'BUZURUGA%']);
    console.log(`  Result: ${test3.rows[0].count} services found`);
    
    // Test without area filter
    console.log('\nTEST 4: Without area filter - MWANZA/ILEMELA only');
    const test4 = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.status = 'active' AND s.is_active = true
        AND LOWER(s.region) = LOWER($1)
        AND LOWER(s.district) = LOWER($2)
    `, ['MWANZA', 'ILEMELA']);
    console.log(`  Result: ${test4.rows[0].count} services found`);
    
    console.log('\n✅ DIAGNOSIS COMPLETE');
    console.log('\n💡 SOLUTION: Backend should use LIKE for area matching or frontend should send exact area names');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testLocationMismatch();
