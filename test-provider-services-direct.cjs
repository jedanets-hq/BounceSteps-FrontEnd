const { pool } = require('./backend/config/postgresql.js');

async function testProviderServices() {
  try {
    console.log('🔍 Testing Provider Services...\n');
    
    // 1. Check all providers
    const providersResult = await pool.query(`
      SELECT sp.id, sp.business_name, sp.user_id, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.id
    `);
    
    console.log(`📊 Total Providers: ${providersResult.rows.length}`);
    providersResult.rows.forEach(p => {
      console.log(`   - Provider ID: ${p.id}, Business: ${p.business_name}, User ID: ${p.user_id}, Email: ${p.email}`);
    });
    console.log('');
    
    // 2. Check all services
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, category, price, is_active
      FROM services
      ORDER BY provider_id, id
    `);
    
    console.log(`📦 Total Services: ${servicesResult.rows.length}`);
    servicesResult.rows.forEach(s => {
      console.log(`   - Service ID: ${s.id}, Title: ${s.title}, Provider ID: ${s.provider_id}, Active: ${s.is_active}`);
    });
    console.log('');
    
    // 3. Check services per provider
    const servicesPerProvider = await pool.query(`
      SELECT sp.id as provider_id, sp.business_name, COUNT(s.id) as service_count
      FROM service_providers sp
      LEFT JOIN services s ON sp.id = s.provider_id
      GROUP BY sp.id, sp.business_name
      ORDER BY sp.id
    `);
    
    console.log('📊 Services Per Provider:');
    servicesPerProvider.rows.forEach(p => {
      console.log(`   - ${p.business_name} (ID: ${p.provider_id}): ${p.service_count} services`);
    });
    console.log('');
    
    // 4. Test specific provider profile endpoint
    if (providersResult.rows.length > 0) {
      const testProviderId = providersResult.rows[0].id;
      console.log(`🧪 Testing Provider Profile for ID: ${testProviderId}`);
      
      const profileResult = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = $1
      `, [testProviderId]);
      
      if (profileResult.rows.length > 0) {
        console.log('✅ Provider Profile Found:');
        console.log(`   Business Name: ${profileResult.rows[0].business_name}`);
        console.log(`   Email: ${profileResult.rows[0].email}`);
        console.log(`   Verified: ${profileResult.rows[0].is_verified}`);
        
        // Get services for this provider
        const providerServicesResult = await pool.query(`
          SELECT id, title, category, price, is_active
          FROM services
          WHERE provider_id = $1 AND is_active = true
        `, [testProviderId]);
        
        console.log(`   Services: ${providerServicesResult.rows.length}`);
        providerServicesResult.rows.forEach(s => {
          console.log(`      - ${s.title} (${s.category}) - TZS ${s.price}`);
        });
      } else {
        console.log('❌ Provider Profile Not Found');
      }
    }
    
    console.log('\n✅ Test Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testProviderServices();
