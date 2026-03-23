const { Pool } = require('pg');

// Test LOCAL database
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testProviderIssue() {
  try {
    console.log('🔍 Testing provider issue...\n');
    
    // Test 1: Check service_providers table
    const providersResult = await pool.query('SELECT id, user_id, business_name FROM service_providers LIMIT 5');
    console.log('📊 Service Providers:', providersResult.rows);
    
    // Test 2: Check services table
    const servicesResult = await pool.query('SELECT id, title, provider_id FROM services LIMIT 5');
    console.log('\n📦 Services:', servicesResult.rows);
    
    // Test 3: Check if provider ID 1 exists
    const provider1 = await pool.query('SELECT * FROM service_providers WHERE id = 1 OR user_id = 1');
    console.log('\n🔍 Provider ID 1:', provider1.rows);
    
    // Test 4: Check services for provider 1
    if (provider1.rows.length > 0) {
      const providerServices = await pool.query('SELECT * FROM services WHERE provider_id = $1', [provider1.rows[0].id]);
      console.log('\n📦 Services for provider 1:', providerServices.rows);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderIssue();
