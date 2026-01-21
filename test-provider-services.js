const { pool } = require('./models');

async function testProviderServices() {
  try {
    console.log('🔍 Testing provider services...\n');
    
    // Get all users who are service providers
    const providersResult = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role
      FROM users u
      WHERE u.role = 'service_provider'
      LIMIT 5
    `);
    
    console.log(`📊 Found ${providersResult.rows.length} service providers\n`);
    
    for (const provider of providersResult.rows) {
      console.log(`\n👤 Provider: ${provider.first_name} ${provider.last_name} (${provider.email})`);
      console.log(`   ID: ${provider.id}`);
      
      // Get services for this provider
      const servicesResult = await pool.query(`
        SELECT id, title, category, price, status, is_active, created_at
        FROM services
        WHERE provider_id = $1
        ORDER BY created_at DESC
      `, [provider.id]);
      
      console.log(`   Services: ${servicesResult.rows.length}`);
      
      if (servicesResult.rows.length > 0) {
        servicesResult.rows.forEach((service, idx) => {
          console.log(`\n   ${idx + 1}. ${service.title}`);
          console.log(`      Category: ${service.category}`);
          console.log(`      Price: ${service.price}`);
          console.log(`      Status: ${service.status}`);
          console.log(`      Active: ${service.is_active}`);
          console.log(`      Created: ${service.created_at}`);
        });
      } else {
        console.log(`   ⚠️ No services found for this provider`);
      }
    }
    
    // Check total services in database
    const totalResult = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`\n\n📊 Total services in database: ${totalResult.rows[0].count}`);
    
    await pool.end();
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
  }
}

testProviderServices();
