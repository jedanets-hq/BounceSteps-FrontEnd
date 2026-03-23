const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function fixProvider7() {
  try {
    console.log('🔧 Fixing Provider 7 issue...\n');
    
    // First, check the service with provider_id = 7
    const serviceResult = await pool.query(
      'SELECT * FROM services WHERE provider_id = 7'
    );
    
    if (serviceResult.rows.length > 0) {
      const service = serviceResult.rows[0];
      console.log('📦 Found service with provider_id = 7:');
      console.log(`   Service ID: ${service.id}`);
      console.log(`   Title: ${service.title}`);
      console.log(`   Business Name: ${service.business_name}`);
      console.log(`   Location: ${service.location}`);
      console.log(`   User ID: ${service.user_id}`);
      
      // Check if there's a provider with this user_id
      if (service.user_id) {
        const existingProvider = await pool.query(
          'SELECT * FROM service_providers WHERE user_id = $1',
          [service.user_id]
        );
        
        if (existingProvider.rows.length > 0) {
          console.log('\n✅ Found existing provider for this user:');
          console.log(`   Provider ID: ${existingProvider.rows[0].id}`);
          console.log(`   Business Name: ${existingProvider.rows[0].business_name}`);
          
          // Update the service to point to the correct provider
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [existingProvider.rows[0].id, service.id]
          );
          
          console.log(`\n✅ Updated service ${service.id} to use provider ${existingProvider.rows[0].id}`);
        } else {
          // Create a new provider for this service
          console.log('\n🆕 Creating new provider for this service...');
          
          const newProvider = await pool.query(
            `INSERT INTO service_providers 
             (user_id, business_name, location, category, is_verified, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) 
             RETURNING *`,
            [
              service.user_id,
              service.business_name || 'Service Provider',
              service.location || 'Tanzania',
              service.category || 'Transportation',
              false
            ]
          );
          
          console.log(`✅ Created provider ID: ${newProvider.rows[0].id}`);
          
          // Update the service to point to the new provider
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [newProvider.rows[0].id, service.id]
          );
          
          console.log(`✅ Updated service ${service.id} to use new provider ${newProvider.rows[0].id}`);
        }
      } else {
        console.log('\n⚠️ Service has no user_id. Cannot create/link provider.');
        console.log('   Please manually assign a user_id to this service first.');
      }
    } else {
      console.log('❌ No services found with provider_id = 7');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const orphanServices = await pool.query(
      `SELECT s.id, s.title, s.provider_id 
       FROM services s 
       LEFT JOIN service_providers sp ON s.provider_id = sp.id 
       WHERE sp.id IS NULL`
    );
    
    if (orphanServices.rows.length > 0) {
      console.log(`\n⚠️ Found ${orphanServices.rows.length} orphan services (services without valid provider):`);
      orphanServices.rows.forEach(s => {
        console.log(`   - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
      });
    } else {
      console.log('\n✅ All services have valid providers!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit();
  }
}

fixProvider7();
