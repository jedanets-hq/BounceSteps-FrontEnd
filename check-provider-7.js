import pg from './backend/config/postgresql.js';

async function checkProvider() {
  try {
    console.log('🔍 Checking provider ID 7...');
    
    // Check if provider exists
    const providerResult = await pg.pool.query(
      'SELECT * FROM service_providers WHERE id = 7'
    );
    
    console.log('\n📦 Provider 7 data:');
    console.log(providerResult.rows);
    
    // Check services for this provider
    const servicesResult = await pg.pool.query(
      'SELECT id, title, category, price, provider_id FROM services WHERE provider_id = 7'
    );
    
    console.log('\n📦 Services for provider 7:');
    console.log(servicesResult.rows);
    
    // Check all providers
    const allProvidersResult = await pg.pool.query(
      'SELECT id, business_name, location FROM service_providers ORDER BY id'
    );
    
    console.log('\n📦 All providers:');
    console.log(allProvidersResult.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pg.pool.end();
    process.exit();
  }
}

checkProvider();
