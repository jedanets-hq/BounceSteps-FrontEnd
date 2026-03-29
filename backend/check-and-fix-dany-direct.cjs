const { Client } = require('pg');

async function checkAndFixDany() {
  // Use connection string from .env
  const client = new Client({
    connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    console.log('🔍 Checking dany danny (danford@gmail.com)...\n');
    
    // Find the user
    const userResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.is_active
      FROM users u
      WHERE u.email = 'danford@gmail.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email: danford@gmail.com');
      await client.end();
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   User Type: ${user.user_type}`);
    console.log(`   Active: ${user.is_active}`);
    
    // Check if they have a service provider profile
    const providerResult = await client.query(`
      SELECT 
        sp.id,
        sp.business_name,
        sp.is_verified
      FROM service_providers sp
      WHERE sp.user_id = $1
    `, [user.id]);
    
    if (providerResult.rows.length > 0) {
      console.log('\n🏢 Service Provider Profile Found:');
      providerResult.rows.forEach(provider => {
        console.log(`   Provider ID: ${provider.id}`);
        console.log(`   Business Name: ${provider.business_name || 'N/A'}`);
        console.log(`   Verified: ${provider.is_verified}`);
      });
      
      console.log('\n' + '='.repeat(60));
      if (user.user_type === 'traveler') {
        console.log('❌ PROBLEM FOUND: This is a TRAVELER with a service_providers record!');
        console.log('   This should NOT happen. Cleaning up...\n');
        
        await client.query('BEGIN');
        
        // Delete badges
        const deleteBadges = await client.query(`
          DELETE FROM provider_badges
          WHERE provider_id IN (
            SELECT sp.id FROM service_providers sp WHERE sp.user_id = $1
          )
        `, [user.id]);
        console.log(`   ✓ Deleted ${deleteBadges.rowCount} badge(s)`);
        
        // Delete services
        const deleteServices = await client.query(`
          DELETE FROM services
          WHERE provider_id IN (
            SELECT sp.id FROM service_providers sp WHERE sp.user_id = $1
          )
        `, [user.id]);
        console.log(`   ✓ Deleted ${deleteServices.rowCount} service(s)`);
        
        // Delete bookings
        const deleteBookings = await client.query(`
          DELETE FROM bookings
          WHERE provider_id IN (
            SELECT sp.id FROM service_providers sp WHERE sp.user_id = $1
          )
        `, [user.id]);
        console.log(`   ✓ Deleted ${deleteBookings.rowCount} booking(s)`);
        
        // Delete provider record
        const deleteProvider = await client.query(`
          DELETE FROM service_providers
          WHERE user_id = $1
        `, [user.id]);
        console.log(`   ✓ Deleted ${deleteProvider.rowCount} provider record(s)`);
        
        await client.query('COMMIT');
        
        console.log('\n✅ Cleanup complete! User will no longer appear in Badge Management.');
      } else if (user.user_type === 'service_provider') {
        console.log('✅ This is a valid SERVICE PROVIDER.');
        console.log('   They SHOULD appear in Badge Management.');
        console.log('   No action needed.');
      }
      console.log('='.repeat(60));
    } else {
      console.log('\n❌ No service provider profile found');
      console.log('   This user should not appear in Badge Management at all.');
    }
    
    await client.end();
    console.log('\n✅ Done!');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

checkAndFixDany();
