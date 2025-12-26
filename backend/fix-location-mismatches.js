const { pool } = require('./config/postgresql');

async function fixLocationMismatches() {
  try {
    console.log('\n🔧 FIXING LOCATION MISMATCHES\n');
    
    // Step 1: Show current Mbeya services
    const before = await pool.query(`
      SELECT id, title, district, area 
      FROM services 
      WHERE region = 'Mbeya' AND district = 'Mbeya Urban'
    `);
    
    console.log(`Found ${before.rows.length} services with district 'Mbeya Urban':`);
    before.rows.forEach(s => console.log(`  - ${s.title} (${s.district} - ${s.area})`));
    
    // Step 2: Update "Mbeya Urban" to "Mbeya City" to match frontend
    console.log('\n📝 Updating "Mbeya Urban" → "Mbeya City"...');
    const updateResult = await pool.query(`
      UPDATE services 
      SET district = 'Mbeya City' 
      WHERE region = 'Mbeya' AND district = 'Mbeya Urban'
      RETURNING id, title, district
    `);
    
    console.log(`✅ Updated ${updateResult.rows.length} services`);
    
    // Step 3: Verify the update
    const after = await pool.query(`
      SELECT id, title, district, area 
      FROM services 
      WHERE region = 'Mbeya' AND district = 'Mbeya City'
    `);
    
    console.log(`\n✅ Verification: ${after.rows.length} services now have district 'Mbeya City':`);
    after.rows.forEach(s => console.log(`  - ${s.title} (${s.district} - ${s.area})`));
    
    // Step 4: Check for other common mismatches
    console.log('\n\n🔍 Checking for other potential mismatches...');
    
    const allDistricts = await pool.query(`
      SELECT DISTINCT region, district 
      FROM services 
      WHERE region IN ('Dar es Salaam', 'Arusha', 'Kilimanjaro', 'Zanzibar')
      ORDER BY region, district
    `);
    
    console.log('\nOther regions in database:');
    let currentRegion = '';
    allDistricts.rows.forEach(r => {
      if (r.region !== currentRegion) {
        console.log(`\n${r.region}:`);
        currentRegion = r.region;
      }
      console.log(`  - ${r.district}`);
    });
    
    console.log('\n✅ Fix complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixLocationMismatches();