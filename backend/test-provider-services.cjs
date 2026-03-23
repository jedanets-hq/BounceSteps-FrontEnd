const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderServices() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 TESTING PROVIDER SERVICES QUERY\n');
    
    // Get a provider
    const providerResult = await client.query(`
      SELECT sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No providers found');
      return;
    }
    
    const provider = providerResult.rows[0];
    console.log('✅ Test provider:');
    console.log(`   User ID: ${provider.user_id}`);
    console.log(`   Business: ${provider.business_name}`);
    console.log(`   Email: ${provider.email}`);
    
    // Query services for this provider (same as API but simplified)
    console.log('\n📝 Querying provider services...');
    
    const servicesResult = await client.query(`
      SELECT s.*
      FROM services s
      WHERE s.provider_id = $1
      ORDER BY s.created_at DESC
    `, [provider.user_id]);
    
    console.log(`✅ Found ${servicesResult.rows.length} service(s)`);
    
    if (servicesResult.rows.length > 0) {
      servicesResult.rows.forEach((service, index) => {
        console.log(`\n   Service ${index + 1}:`);
        console.log(`   - ID: ${service.id}`);
        console.log(`   - Title: ${service.title}`);
        console.log(`   - Category: ${service.category}`);
        console.log(`   - Price: ${service.price}`);
        console.log(`   - Status: ${service.status || 'active'}`);
        console.log(`   - Provider ID: ${service.provider_id}`);
      });
    } else {
      console.log('\n⚠️  No services found for this provider');
      console.log('   This could be why services are not showing in the UI');
      
      // Check if there are any services at all
      const allServicesResult = await client.query(`
        SELECT COUNT(*) as total FROM services
      `);
      console.log(`\n   Total services in database: ${allServicesResult.rows[0].total}`);
      
      // Check services with their provider_ids
      const servicesWithProviders = await client.query(`
        SELECT s.id, s.title, s.provider_id, sp.user_id as sp_user_id
        FROM services s
        LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
        LIMIT 5
      `);
      
      console.log('\n   Sample services:');
      servicesWithProviders.rows.forEach(s => {
        console.log(`   - Service ${s.id}: provider_id=${s.provider_id}, sp.user_id=${s.sp_user_id}`);
      });
    }
    
    console.log('\n✅ PROVIDER SERVICES QUERY TEST COMPLETE');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testProviderServices();
