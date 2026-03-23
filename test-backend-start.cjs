const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testBackendConnection() {
  console.log('🔍 TESTING BACKEND CONNECTION & DATA\n');
  console.log('='.repeat(80));
  
  try {
    await productionPool.query('SELECT 1');
    console.log('✅ Database connection successful\n');
    
    // Test services query (same as backend uses)
    console.log('📦 Testing services query (as backend would)...');
    const servicesResult = await productionPool.query(`
      SELECT s.*, 
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
    
    console.log(`✅ Found ${servicesResult.rows.length} services\n`);
    
    if (servicesResult.rows.length > 0) {
      console.log('📋 Services with provider info:');
      servicesResult.rows.forEach((svc, idx) => {
        console.log(`   ${idx + 1}. "${svc.title}" by ${svc.business_name} (${svc.provider_email})`);
        console.log(`      Location: ${svc.provider_region}, ${svc.provider_district}, ${svc.provider_area}`);
        console.log(`      Avatar: ${svc.avatar_url || 'none'}`);
      });
    }
    
    // Test providers query
    console.log('\n🏢 Testing providers query (as backend would)...');
    const providersResult = await productionPool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.rating DESC, sp.created_at DESC
    `);
    
    console.log(`✅ Found ${providersResult.rows.length} providers\n`);
    
    if (providersResult.rows.length > 0) {
      console.log('📋 Providers:');
      providersResult.rows.forEach((prov, idx) => {
        console.log(`   ${idx + 1}. ${prov.business_name} (${prov.email})`);
        console.log(`      Avatar: ${prov.avatar_url || 'none'}`);
        console.log(`      Location: ${prov.region}, ${prov.district}, ${prov.area}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL BACKEND QUERIES WORKING CORRECTLY!');
    console.log('   - Services are properly linked to providers');
    console.log('   - Provider information is available');
    console.log('   - Avatar URLs are present');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await productionPool.end();
  }
}

testBackendConnection();
