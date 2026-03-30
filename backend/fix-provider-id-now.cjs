const { pool } = require('./models');

async function fixProviderIds() {
  try {
    console.log('🔧 FIXING PROVIDER IDS IN SERVICES TABLE\n');
    
    // Find services with wrong provider_id
    const wrongServices = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id as current_provider_id,
        s.title,
        sp.id as correct_provider_id,
        sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.provider_id != sp.id
    `);
    
    console.log(`Found ${wrongServices.rows.length} services with wrong provider_id\n`);
    
    if (wrongServices.rows.length === 0) {
      console.log('✅ All services have correct provider_id!');
      return;
    }
    
    // Fix each service
    for (const service of wrongServices.rows) {
      console.log(`Fixing Service #${service.service_id}: "${service.title}"`);
      console.log(`  Current provider_id: ${service.current_provider_id} (user_id)`);
      console.log(`  Correct provider_id: ${service.correct_provider_id} (service_providers.id)`);
      console.log(`  Provider: ${service.business_name}`);
      
      await pool.query(
        'UPDATE services SET provider_id = $1 WHERE id = $2',
        [service.correct_provider_id, service.service_id]
      );
      
      console.log(`  ✅ Fixed!\n`);
    }
    
    console.log(`\n✅ Successfully fixed ${wrongServices.rows.length} services!`);
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const verifyQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.provider_id != sp.id
    `);
    
    if (verifyQuery.rows[0].count === '0') {
      console.log('✅ Verification passed! All services now have correct provider_id');
    } else {
      console.log(`⚠️  Still ${verifyQuery.rows[0].count} services with wrong provider_id`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixProviderIds();
