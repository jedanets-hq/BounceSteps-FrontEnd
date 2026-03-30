const { Pool } = require('./backend/node_modules/pg');

// PRODUCTION database connection
const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkProductionDatabase() {
  console.log('🔍 CHECKING PRODUCTION DATABASE (RENDER)\n');
  console.log('='.repeat(60));
  
  try {
    console.log('\n✅ Connecting to production database...');
    await productionPool.query('SELECT 1');
    console.log('✅ Connected successfully!');
    
    // Check service_providers - HAPA NDIO TATIZO!
    console.log('\n🏢 SERVICE_PROVIDERS:');
    const providersResult = await productionPool.query(`
      SELECT id, user_id, business_name, email, phone, is_active, created_at
      FROM service_providers
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log(`   Total providers: ${providersResult.rows.length}`);
    providersResult.rows.forEach((row, idx) => {
      console.log(`     ${idx + 1}. ID: ${row.id} | ${row.business_name} | Active: ${row.is_active} | User: ${row.user_id}`);
    });
    
    // Check services - HAPA NDIO TATIZO!
    console.log('\n🎯 SERVICES:');
    const servicesResult = await productionPool.query(`
      SELECT s.id, s.provider_id, s.title, s.category, s.is_active, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);
    console.log(`   Total services: ${servicesResult.rows.length}`);
    servicesResult.rows.forEach((row, idx) => {
      console.log(`     ${idx + 1}. ID: ${row.id} | ${row.title} | Provider: ${row.business_name} (${row.provider_id}) | Active: ${row.is_active}`);
    });
    
    // Check users with provider role
    console.log('\n👥 USERS (service_provider role):');
    const usersResult = await productionPool.query(`
      SELECT u.id, u.email, u.user_type, sp.id as provider_id, sp.business_name
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE u.user_type = 'service_provider'
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    console.log(`   Total service provider users: ${usersResult.rows.length}`);
    usersResult.rows.forEach((row, idx) => {
      console.log(`     ${idx + 1}. User ID: ${row.id} | ${row.email} | Provider ID: ${row.provider_id} | Business: ${row.business_name || 'NO PROVIDER RECORD'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRITICAL CHECK:');
    console.log('   1. Are there service_providers records?');
    console.log('   2. Are there services records?');
    console.log('   3. Do users have matching service_providers records?');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await productionPool.end();
  }
}

checkProductionDatabase();
