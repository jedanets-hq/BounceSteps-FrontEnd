const { pool } = require('./config/postgresql');

async function checkMbeyaData() {
  try {
    console.log('\n🔍 CHECKING MBEYA DATA - EXACT VALUES\n');

    // Get all Mbeya services with exact field values
    const result = await pool.query(`
      SELECT 
        s.id,
        s.title,
        s.category,
        '|' || s.region || '|' as region_with_markers,
        '|' || s.district || '|' as district_with_markers,
        '|' || s.area || '|' as area_with_markers,
        s.provider_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE LOWER(s.region) LIKE '%mbeya%'
      ORDER BY s.district, s.area
    `);

    console.log(`Found ${result.rows.length} services in Mbeya region:\n`);

    result.rows.forEach((s, idx) => {
      console.log(`${idx + 1}. "${s.title}"`);
      console.log(`   ID: ${s.id}`);
      console.log(`   Category: ${s.category}`);
      console.log(`   Region: ${s.region_with_markers}`);
      console.log(`   District: ${s.district_with_markers}`);
      console.log(`   Area: ${s.area_with_markers}`);
      console.log(`   Provider: ${s.business_name}`);
      console.log('');
    });

    // Show unique combinations
    const uniqueCombos = [...new Set(result.rows.map(s => 
      `${s.region_with_markers.trim()} → ${s.district_with_markers.trim()} → ${s.area_with_markers.trim()}`
    ))];

    console.log('\nUnique Location Combinations:');
    uniqueCombos.forEach(combo => console.log(`  - ${combo}`));

    console.log('\n✅ Check complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkMbeyaData();