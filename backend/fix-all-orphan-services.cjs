const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'isafari_db',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  port: process.env.DB_PORT || 5432,
});

async function fixOrphanServices() {
  try {
    console.log('🔧 Fixing all orphan services...\n');
    
    // Find all orphan services
    const orphanServices = await pool.query(
      `SELECT s.* 
       FROM services s 
       LEFT JOIN service_providers sp ON s.provider_id = sp.id 
       WHERE sp.id IS NULL`
    );
    
    console.log(`Found ${orphanServices.rows.length} orphan services\n`);
    
    for (const service of orphanServices.rows) {
      console.log(`\n📦 Processing Service ${service.id}: ${service.title}`);
      console.log(`   Current provider_id: ${service.provider_id}`);
      console.log(`   Business Name: ${service.business_name || 'N/A'}`);
      console.log(`   Location: ${service.location || 'N/A'}`);
      console.log(`   User ID: ${service.user_id || 'N/A'}`);
      
      // Strategy 1: If service has user_id, find or create provider for that user
      if (service.user_id) {
        const existingProvider = await pool.query(
          'SELECT * FROM service_providers WHERE user_id = $1',
          [service.user_id]
        );
        
        if (existingProvider.rows.length > 0) {
          // Use existing provider
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [existingProvider.rows[0].id, service.id]
          );
          console.log(`   ✅ Linked to existing provider ${existingProvider.rows[0].id}`);
        } else {
          // Create new provider for this user
          const newProvider = await pool.query(
            `INSERT INTO service_providers 
             (user_id, business_name, location, category, is_verified, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) 
             RETURNING *`,
            [
              service.user_id,
              service.business_name || 'Service Provider',
              service.location || 'Tanzania',
              service.category || 'General',
              false
            ]
          );
          
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [newProvider.rows[0].id, service.id]
          );
          
          console.log(`   ✅ Created new provider ${newProvider.rows[0].id} and linked service`);
        }
      } 
      // Strategy 2: If no user_id, try to find a provider with matching business_name
      else if (service.business_name) {
        const matchingProvider = await pool.query(
          'SELECT * FROM service_providers WHERE business_name = $1 LIMIT 1',
          [service.business_name]
        );
        
        if (matchingProvider.rows.length > 0) {
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [matchingProvider.rows[0].id, service.id]
          );
          console.log(`   ✅ Linked to provider ${matchingProvider.rows[0].id} by business name match`);
        } else {
          // Create provider without user_id (will need manual user assignment later)
          const newProvider = await pool.query(
            `INSERT INTO service_providers 
             (business_name, location, category, is_verified, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) 
             RETURNING *`,
            [
              service.business_name,
              service.location || 'Tanzania',
              service.category || 'General',
              false
            ]
          );
          
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [newProvider.rows[0].id, service.id]
          );
          
          console.log(`   ✅ Created new provider ${newProvider.rows[0].id} (no user_id) and linked service`);
        }
      }
      // Strategy 3: Assign to first available provider as fallback
      else {
        const firstProvider = await pool.query(
          'SELECT * FROM service_providers ORDER BY id LIMIT 1'
        );
        
        if (firstProvider.rows.length > 0) {
          await pool.query(
            'UPDATE services SET provider_id = $1 WHERE id = $2',
            [firstProvider.rows[0].id, service.id]
          );
          console.log(`   ⚠️ Assigned to first available provider ${firstProvider.rows[0].id} (fallback)`);
        } else {
          console.log(`   ❌ Cannot fix - no providers available in database`);
        }
      }
    }
    
    // Final verification
    console.log('\n\n🔍 Final Verification...');
    const remainingOrphans = await pool.query(
      `SELECT s.id, s.title, s.provider_id 
       FROM services s 
       LEFT JOIN service_providers sp ON s.provider_id = sp.id 
       WHERE sp.id IS NULL`
    );
    
    if (remainingOrphans.rows.length > 0) {
      console.log(`\n⚠️ Still have ${remainingOrphans.rows.length} orphan services:`);
      remainingOrphans.rows.forEach(s => {
        console.log(`   - Service ${s.id}: ${s.title} (provider_id: ${s.provider_id})`);
      });
    } else {
      console.log('\n✅ SUCCESS! All services now have valid providers!');
    }
    
    // Show all providers
    console.log('\n📊 Current Providers:');
    const allProviders = await pool.query(
      'SELECT id, business_name, location FROM service_providers ORDER BY id'
    );
    allProviders.rows.forEach(p => {
      console.log(`   ID ${p.id}: ${p.business_name} - ${p.location}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit();
  }
}

fixOrphanServices();
