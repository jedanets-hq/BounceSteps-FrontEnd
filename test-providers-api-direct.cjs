const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testAPI() {
  console.log('🔍 TESTING PROVIDERS API QUERY\n');
  
  try {
    // Same query as API
    const result = await productionPool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.rating DESC, sp.created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} providers\n`);
    
    result.rows.forEach((p, idx) => {
      console.log(`Provider ${idx + 1}:`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Business: ${p.business_name}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   User ID: ${p.user_id}`);
      console.log(`   Rating: ${p.rating}`);
      console.log('');
    });
    
    // Now test services query for first provider
    if (result.rows.length > 0) {
      const providerId = result.rows[0].id;
      console.log(`\n🎯 TESTING SERVICES FOR PROVIDER ID: ${providerId}\n`);
      
      const servicesResult = await productionPool.query(`
        SELECT * FROM services WHERE provider_id = $1
      `, [providerId]);
      
      console.log(`✅ Found ${servicesResult.rows.length} services\n`);
      
      servicesResult.rows.forEach((s, idx) => {
        console.log(`Service ${idx + 1}:`);
        console.log(`   ID: ${s.id}`);
        console.log(`   Title: ${s.title}`);
        console.log(`   Category: ${s.category}`);
        console.log(`   Provider ID: ${s.provider_id}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await productionPool.end();
  }
}

testAPI();
