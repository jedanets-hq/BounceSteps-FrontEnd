// Migration: Fix provider locations - change IKUTI (street) to IYUNGA (ward)
const { pool } = require('../models');

async function fixIkutiToIyunga() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔧 Fixing provider locations: IKUTI → IYUNGA...\n');
    
    // Step 1: Update service_providers table
    const providersResult = await client.query(`
      UPDATE service_providers
      SET area = 'IYUNGA',
          ward = 'IYUNGA',
          updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(region) = LOWER('MBEYA')
        AND LOWER(area) = LOWER('IKUTI')
      RETURNING user_id, business_name, region, district, area
    `);
    
    console.log(`✅ Updated ${providersResult.rows.length} providers`);
    providersResult.rows.forEach(p => {
      console.log(`   - ${p.business_name}: ${p.region} > ${p.district} > ${p.area}`);
    });
    
    // Step 2: Update services table to match provider location
    const servicesResult = await client.query(`
      UPDATE services s
      SET area = 'IYUNGA',
          updated_at = CURRENT_TIMESTAMP
      FROM service_providers sp
      WHERE s.provider_id = sp.user_id
        AND LOWER(sp.region) = LOWER('MBEYA')
        AND LOWER(sp.area) = LOWER('IYUNGA')
        AND LOWER(s.area) = LOWER('IKUTI')
      RETURNING s.id, s.title, s.area
    `);
    
    console.log(`\n✅ Updated ${servicesResult.rows.length} services`);
    servicesResult.rows.forEach(s => {
      console.log(`   - ${s.title}: area = ${s.area}`);
    });
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('📍 Providers can now be found at: MBEYA > MBEYA CBD > IYUNGA');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
fixIkutiToIyunga()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
