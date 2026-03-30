const { pool } = require('./config/postgresql');

async function fixOrphanService() {
  try {
    console.log('🔧 Fixing orphan service with provider_id = 4...\n');
    
    // Check current state
    const serviceCheck = await pool.query(`
      SELECT id, title, provider_id 
      FROM services 
      WHERE provider_id = 4
    `);
    
    if (serviceCheck.rows.length === 0) {
      console.log('✅ No orphan services found with provider_id = 4');
      return;
    }
    
    console.log(`Found ${serviceCheck.rows.length} orphan service(s):`);
    serviceCheck.rows.forEach(service => {
      console.log(`  - Service ID ${service.id}: ${service.title} (provider_id: ${service.provider_id})`);
    });
    
    // Update to point to existing provider (user_id = 7)
    const updateResult = await pool.query(`
      UPDATE services 
      SET provider_id = 7 
      WHERE provider_id = 4
      RETURNING id, title, provider_id
    `);
    
    console.log(`\n✅ Updated ${updateResult.rows.length} service(s) to provider_id = 7:`);
    updateResult.rows.forEach(service => {
      console.log(`  - Service ID ${service.id}: ${service.title} (new provider_id: ${service.provider_id})`);
    });
    
    // Verify the fix
    const verifyResult = await pool.query(`
      SELECT s.id, s.title, s.provider_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.id IN (${updateResult.rows.map(r => r.id).join(',')})
    `);
    
    console.log('\n✅ Verification:');
    verifyResult.rows.forEach(service => {
      console.log(`  - Service "${service.title}" now linked to provider "${service.business_name}"`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixOrphanService();
