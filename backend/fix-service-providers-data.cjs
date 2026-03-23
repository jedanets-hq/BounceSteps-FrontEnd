const { pool } = require('./config/postgresql');

async function fixServiceProvidersData() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing service providers data...\n');
    
    await client.query('BEGIN');
    
    // Step 1: Find all services that have provider_id but no matching service_provider record
    console.log('Step 1: Finding services with missing provider records...');
    const orphanedServices = await client.query(`
      SELECT DISTINCT s.provider_id, u.email, u.first_name, u.last_name, u.role
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE sp.id IS NULL AND s.provider_id IS NOT NULL
    `);
    
    console.log(`Found ${orphanedServices.rows.length} users with services but no service_provider record`);
    
    if (orphanedServices.rows.length === 0) {
      console.log('✅ All services have valid provider records!');
      await client.query('COMMIT');
      await pool.end();
      return;
    }
    
    // Step 2: Create service_provider records for these users
    console.log('\nStep 2: Creating missing service_provider records...');
    
    for (const user of orphanedServices.rows) {
      console.log(`  Creating provider record for user ${user.provider_id} (${user.email})...`);
      
      // Create service_provider record
      await client.query(`
        INSERT INTO service_providers (
          user_id,
          business_name,
          business_type,
          location,
          description,
          service_categories,
          rating,
          total_reviews,
          is_verified,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING
      `, [
        user.provider_id,
        `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Service Provider',
        'General Services',
        'Tanzania',
        'Service provider',
        JSON.stringify(['General']),
        0,
        0,
        false
      ]);
      
      console.log(`  ✅ Created provider record for user ${user.provider_id}`);
    }
    
    // Step 3: Verify all services now have valid provider records
    console.log('\nStep 3: Verifying fix...');
    const stillOrphaned = await client.query(`
      SELECT COUNT(*) as count
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE sp.id IS NULL AND s.provider_id IS NOT NULL
    `);
    
    if (parseInt(stillOrphaned.rows[0].count) === 0) {
      console.log('✅ All services now have valid provider records!');
    } else {
      console.log(`❌ Still have ${stillOrphaned.rows[0].count} services without provider records`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Service providers data fix completed!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing service providers data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixServiceProvidersData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
