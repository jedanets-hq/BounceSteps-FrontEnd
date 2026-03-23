const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'isafari_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function testServicesAPIResponse() {
  try {
    console.log('🧪 TESTING SERVICES API RESPONSE\n');
    console.log('='.repeat(80));
    
    // Mimic the services.js GET / endpoint query
    const result = await pool.query(`
      SELECT s.*, 
             sp.id as service_provider_id,
             sp.user_id as provider_user_id,
             sp.business_name, 
             sp.location as provider_location,
             sp.rating as provider_rating,
             sp.is_verified as provider_verified,
             sp.region as provider_region,
             sp.district as provider_district,
             sp.area as provider_area,
             sp.service_categories as provider_service_categories,
             u.first_name as provider_first_name,
             u.last_name as provider_last_name,
             u.email as provider_email,
             u.avatar_url,
             u.is_verified as user_verified
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.id
      INNER JOIN users u ON sp.user_id = u.id
      WHERE s.status = 'active' AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT 100
    `);
    
    console.log(`\n📦 Found ${result.rows.length} services\n`);
    
    result.rows.forEach((service, index) => {
      console.log(`Service #${index + 1}:`);
      console.log(`   Title: ${service.title}`);
      console.log(`   service.id: ${service.id}`);
      console.log(`   service.provider_id: ${service.provider_id} (references service_providers.id)`);
      console.log(`   service_provider_id: ${service.service_provider_id} (from JOIN)`);
      console.log(`   provider_user_id: ${service.provider_user_id} (user_id)`);
      console.log(`   business_name: ${service.business_name}`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    console.log('\n🔍 ANALYSIS:');
    console.log('   When frontend navigates to /provider/${service.provider_id}');
    console.log('   It passes service_providers.id to the provider profile route');
    console.log('   The provider profile route should find the provider and their services');
    console.log('\n✅ TEST COMPLETE\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testServicesAPIResponse();
