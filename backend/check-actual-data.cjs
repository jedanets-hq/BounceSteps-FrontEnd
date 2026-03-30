const { pool } = require('./models');

async function checkData() {
  try {
    console.log('🔍 CHECKING ACTUAL DATABASE DATA\n');
    
    // Get all services with their provider_id
    const services = await pool.query(`
      SELECT id, title, provider_id, is_active, status
      FROM services
      ORDER BY id
    `);
    
    console.log(`Found ${services.rows.length} services:\n`);
    services.rows.forEach(s => {
      console.log(`Service #${s.id}: "${s.title}"`);
      console.log(`  provider_id: ${s.provider_id}`);
      console.log(`  is_active: ${s.is_active}, status: ${s.status}\n`);
    });
    
    // Get all providers
    const providers = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      ORDER BY id
    `);
    
    console.log(`\nFound ${providers.rows.length} providers:\n`);
    providers.rows.forEach(p => {
      console.log(`Provider #${p.id}: "${p.business_name}"`);
      console.log(`  user_id: ${p.user_id}\n`);
    });
    
    // Now check the mismatch
    console.log('\n🔍 CHECKING MISMATCH:\n');
    services.rows.forEach(s => {
      const matchingProvider = providers.rows.find(p => p.id === s.provider_id);
      const userIdMatch = providers.rows.find(p => p.user_id === s.provider_id);
      
      if (matchingProvider) {
        console.log(`✅ Service #${s.id} CORRECTLY linked to Provider #${matchingProvider.id} (${matchingProvider.business_name})`);
      } else if (userIdMatch) {
        console.log(`❌ Service #${s.id} WRONGLY using user_id ${s.provider_id} - should be ${userIdMatch.id}`);
        console.log(`   FIX: UPDATE services SET provider_id = ${userIdMatch.id} WHERE id = ${s.id};`);
      } else {
        console.log(`⚠️  Service #${s.id} has orphaned provider_id ${s.provider_id}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
