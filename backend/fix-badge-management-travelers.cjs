const { pool } = require('./models');

async function fixBadgeManagementTravelers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for travelers in service_providers table...\n');
    
    // Step 1: Find travelers in service_providers table
    const checkResult = await client.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.user_type != 'service_provider'
      ORDER BY sp.id
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ No travelers found in service_providers table. Database is clean!');
      return;
    }
    
    console.log(`❌ Found ${checkResult.rows.length} traveler(s) in service_providers table:\n`);
    checkResult.rows.forEach(row => {
      console.log(`  - Provider ID: ${row.provider_id}`);
      console.log(`    User: ${row.email} (${row.user_type})`);
      console.log(`    Business Name: ${row.business_name || 'N/A'}`);
      console.log('');
    });
    
    // Step 2: Delete these invalid entries
    console.log('🧹 Cleaning up invalid entries...\n');
    
    await client.query('BEGIN');
    
    // First, delete any badges associated with these invalid providers
    const deleteBadgesResult = await client.query(`
      DELETE FROM provider_badges
      WHERE provider_id IN (
        SELECT sp.id
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.user_type != 'service_provider'
      )
    `);
    console.log(`  ✓ Deleted ${deleteBadgesResult.rowCount} badge(s) from invalid providers`);
    
    // Delete any services from these invalid providers
    const deleteServicesResult = await client.query(`
      DELETE FROM services
      WHERE provider_id IN (
        SELECT sp.id
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.user_type != 'service_provider'
      )
    `);
    console.log(`  ✓ Deleted ${deleteServicesResult.rowCount} service(s) from invalid providers`);
    
    // Delete any bookings from these invalid providers
    const deleteBookingsResult = await client.query(`
      DELETE FROM bookings
      WHERE provider_id IN (
        SELECT sp.id
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.user_type != 'service_provider'
      )
    `);
    console.log(`  ✓ Deleted ${deleteBookingsResult.rowCount} booking(s) from invalid providers`);
    
    // Finally, delete the invalid service_providers entries
    const deleteProvidersResult = await client.query(`
      DELETE FROM service_providers
      WHERE id IN (
        SELECT sp.id
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE u.user_type != 'service_provider'
      )
    `);
    console.log(`  ✓ Deleted ${deleteProvidersResult.rowCount} invalid provider record(s)`);
    
    await client.query('COMMIT');
    
    console.log('\n✅ Cleanup complete! Badge Management will now show only service providers.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixBadgeManagementTravelers();
