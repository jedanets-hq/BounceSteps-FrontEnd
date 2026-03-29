const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function checkProvider() {
  try {
    console.log('🔍 Checking provider ID 7...');
    
    // Check if provider exists
    const providerResult = await pool.query(
      'SELECT * FROM service_providers WHERE id = 7'
    );
    
    console.log('\n📦 Provider 7 data:');
    if (providerResult.rows.length === 0) {
      console.log('❌ Provider 7 NOT FOUND in database');
    } else {
      console.log(providerResult.rows[0]);
    }
    
    // Check services for this provider
    const servicesResult = await pool.query(
      'SELECT id, title, category, price, provider_id FROM services WHERE provider_id = 7'
    );
    
    console.log('\n📦 Services for provider 7:');
    console.log(`Found ${servicesResult.rows.length} services`);
    servicesResult.rows.forEach(s => console.log(`  - ${s.title} (${s.category})`));
    
    // Check all providers
    const allProvidersResult = await pool.query(
      'SELECT id, business_name, location FROM service_providers ORDER BY id LIMIT 20'
    );
    
    console.log('\n📦 All providers in database:');
    allProvidersResult.rows.forEach(p => console.log(`  ID ${p.id}: ${p.business_name} - ${p.location}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

checkProvider();
