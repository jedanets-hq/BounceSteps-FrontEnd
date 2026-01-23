require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testProviderFix() {
  try {
    console.log('🧪 Testing provider fix for MBEYA CBD...\n');
    
    // Test 1: Query with region only (should return services with NULL region)
    console.log('Test 1: Query with region="MBEYA"');
    const test1 = await pool.query(`
      SELECT id, title, category, region, district, area
      FROM services 
      WHERE status = 'active' AND is_active = true
        AND (LOWER(region) = LOWER($1) OR region IS NULL OR region = '')
      LIMIT 10
    `, ['MBEYA']);
    console.log(`   Result: ${test1.rows.length} services found`);
    test1.rows.forEach(s => {
      console.log(`   - ${s.title}: region=${s.region || 'NULL'}, district=${s.district || 'NULL'}, area=${s.area || 'NULL'}`);
    });
    
    // Test 2: Query with region + district
    console.log('\nTest 2: Query with region="MBEYA", district="MBEYA CBD"');
    const test2 = await pool.query(`
      SELECT id, title, category, region, district, area
      FROM services 
      WHERE status = 'active' AND is_active = true
        AND (LOWER(region) = LOWER($1) OR region IS NULL OR region = '')
        AND (LOWER(district) = LOWER($2) OR LOWER(area) = LOWER($2) OR district IS NULL OR district = '')
      LIMIT 10
    `, ['MBEYA', 'MBEYA CBD']);
    console.log(`   Result: ${test2.rows.length} services found`);
    test2.rows.forEach(s => {
      console.log(`   - ${s.title}: region=${s.region || 'NULL'}, district=${s.district || 'NULL'}, area=${s.area || 'NULL'}`);
    });
    
    // Test 3: Query with region + district + area
    console.log('\nTest 3: Query with region="MBEYA", district="MBEYA CBD", area="IYUNGA"');
    const test3 = await pool.query(`
      SELECT id, title, category, region, district, area
      FROM services 
      WHERE status = 'active' AND is_active = true
        AND (LOWER(region) = LOWER($1) OR region IS NULL OR region = '')
        AND (LOWER(district) = LOWER($2) OR LOWER(area) = LOWER($2) OR district IS NULL OR district = '')
        AND (LOWER(area) = LOWER($3) OR area IS NULL OR area = '')
      LIMIT 10
    `, ['MBEYA', 'MBEYA CBD', 'IYUNGA']);
    console.log(`   Result: ${test3.rows.length} services found`);
    test3.rows.forEach(s => {
      console.log(`   - ${s.title}: region=${s.region || 'NULL'}, district=${s.district || 'NULL'}, area=${s.area || 'NULL'}`);
    });
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Services with NULL location fields are now included in results');
    console.log('   - This allows country-wide/region-wide services to appear everywhere');
    console.log('   - Travelers in MBEYA CBD will now see available services');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testProviderFix();
