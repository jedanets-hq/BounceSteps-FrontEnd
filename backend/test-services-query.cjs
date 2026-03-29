const { pool } = require('./models');

async function testQuery() {
  try {
    console.log('🔍 Testing services query with location and category filters...\n');
    
    // Example: Dar es Salaam, Ilala, Accommodation
    const region = 'Dar es Salaam';
    const district = 'Ilala';
    const category = 'Accommodation';
    
    console.log(`📍 Searching for: ${category} in ${district}, ${region}\n`);
    
    const result = await pool.query(`
      SELECT s.id, s.title, s.category, s.region, s.district, s.area, sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' 
        AND s.is_active = true
        AND s.region ILIKE $1
        AND (s.district ILIKE $2 OR s.area ILIKE $2)
        AND s.category ILIKE $3
      LIMIT 20
    `, [region, district, category]);
    
    console.log(`✅ Found ${result.rows.length} services\n`);
    
    if (result.rows.length > 0) {
      result.rows.forEach((s, i) => {
        console.log(`${i + 1}. ${s.title}`);
        console.log(`   Provider: ${s.business_name}`);
        console.log(`   Category: ${s.category}`);
        console.log(`   Location: ${s.area || 'N/A'}, ${s.district}, ${s.region}\n`);
      });
    } else {
      console.log('❌ No services found with these filters');
      
      // Try without district filter
      console.log(`\n🔍 Trying without district filter...`);
      const result2 = await pool.query(`
        SELECT s.id, s.title, s.category, s.region, s.district, s.area, sp.business_name
        FROM services s
        INNER JOIN service_providers sp ON s.provider_id = sp.user_id
        WHERE s.status = 'active' 
          AND s.is_active = true
          AND s.region ILIKE $1
          AND s.category ILIKE $2
        LIMIT 20
      `, [region, category]);
      
      console.log(`✅ Found ${result2.rows.length} services in ${region}\n`);
      result2.rows.forEach((s, i) => {
        console.log(`${i + 1}. ${s.title}`);
        console.log(`   Provider: ${s.business_name}`);
        console.log(`   Location: ${s.area || 'N/A'}, ${s.district}, ${s.region}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

testQuery();
