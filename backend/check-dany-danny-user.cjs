const { pool } = require('./models');

async function checkDanyDanny() {
  try {
    console.log('🔍 Checking dany danny user...\n');
    
    // Find the user
    const userResult = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.is_active,
        u.created_at
      FROM users u
      WHERE u.email = 'danford@gmail.com'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email: danford@gmail.com');
      await pool.end();
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   User Type: ${user.user_type}`);
    console.log(`   Active: ${user.is_active}`);
    console.log(`   Created: ${user.created_at}`);
    
    // Check if they have a service provider profile
    const providerResult = await pool.query(`
      SELECT 
        sp.id,
        sp.business_name,
        sp.is_verified,
        sp.created_at
      FROM service_providers sp
      WHERE sp.user_id = $1
    `, [user.id]);
    
    if (providerResult.rows.length > 0) {
      console.log('\n🏢 Service Provider Profile:');
      providerResult.rows.forEach(provider => {
        console.log(`   Provider ID: ${provider.id}`);
        console.log(`   Business Name: ${provider.business_name}`);
        console.log(`   Verified: ${provider.is_verified}`);
        console.log(`   Created: ${provider.created_at}`);
      });
    } else {
      console.log('\n❌ No service provider profile found');
    }
    
    // Check services
    const servicesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      WHERE s.provider_id IN (
        SELECT sp.id FROM service_providers sp WHERE sp.user_id = $1
      )
    `, [user.id]);
    console.log(`\n📦 Services: ${servicesResult.rows[0].count}`);
    
    // Check bookings
    const bookingsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM bookings b
      WHERE b.provider_id IN (
        SELECT sp.id FROM service_providers sp WHERE sp.user_id = $1
      )
    `, [user.id]);
    console.log(`📅 Bookings: ${bookingsResult.rows[0].count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('CONCLUSION:');
    if (user.user_type === 'traveler' && providerResult.rows.length > 0) {
      console.log('❌ PROBLEM: This is a TRAVELER but has a service_providers record!');
      console.log('   This user should NOT appear in Badge Management.');
      console.log('\n💡 Solution: Run fix-badge-management-travelers.cjs to clean up.');
    } else if (user.user_type === 'service_provider') {
      console.log('✅ This is a valid SERVICE PROVIDER.');
      console.log('   They should appear in Badge Management.');
    } else {
      console.log('⚠️  User type:', user.user_type);
    }
    console.log('='.repeat(60));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDanyDanny();
