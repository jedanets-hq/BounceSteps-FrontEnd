const { pool } = require('./models');

async function fixProviderData() {
  console.log('🔧 Fixing provider data...\n');
  
  try {
    // Get services with provider_id
    console.log('📦 Checking services...');
    const services = await pool.query(`
      SELECT DISTINCT provider_id, business_name
      FROM services
      WHERE provider_id IS NOT NULL
      ORDER BY provider_id
    `);
    
    console.log(`Found ${services.rows.length} unique provider_ids in services`);
    
    for (const service of services.rows) {
      const providerId = service.provider_id;
      const businessName = service.business_name || 'Service Provider';
      
      // Check if provider exists in service_providers table
      const providerCheck = await pool.query(`
        SELECT id FROM service_providers WHERE user_id = $1
      `, [providerId]);
      
      if (providerCheck.rows.length === 0) {
        console.log(`\n❌ Provider missing for user_id ${providerId} (${businessName})`);
        
        // Check if user exists
        const userCheck = await pool.query(`
          SELECT id, email, role FROM users WHERE id = $1
        `, [providerId]);
        
        if (userCheck.rows.length > 0) {
          const user = userCheck.rows[0];
          console.log(`   ✅ User exists: ${user.email} (${user.role})`);
          
          // Create service_provider record
          try {
            await pool.query(`
              INSERT INTO service_providers (user_id, business_name, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW())
              ON CONFLICT (user_id) DO NOTHING
            `, [providerId, businessName]);
            console.log(`   ✅ Created service_provider record for user_id ${providerId}`);
          } catch (insertError) {
            console.log(`   ⚠️  Could not create provider: ${insertError.message}`);
          }
        } else {
          console.log(`   ❌ User ${providerId} does not exist!`);
        }
      } else {
        console.log(`✅ Provider exists for user_id ${providerId}`);
      }
    }
    
    console.log('\n✅ Provider data fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixProviderData();
