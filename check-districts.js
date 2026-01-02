const { pool } = require('./config/postgresql');

async function checkDistricts() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT region, district 
      FROM services 
      WHERE region IS NOT NULL 
      ORDER BY region, district
    `);
    
    console.log('\n📊 DISTRICTS IN DATABASE:\n');
    let currentRegion = '';
    result.rows.forEach(r => {
      if (r.region !== currentRegion) {
        console.log(`\n${r.region}:`);
        currentRegion = r.region;
      }
      console.log(`  - ${r.district || '(no district)'}`);
    });
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDistricts();