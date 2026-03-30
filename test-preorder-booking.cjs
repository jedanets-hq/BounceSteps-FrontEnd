const { pool } = require('./backend/config/postgresql');

async function testPreOrderBooking() {
  try {
    console.log('🔍 Testing Pre-Order Booking Creation...\n');
    
    // Step 1: Check if we have any services
    console.log('Step 1: Checking available services...');
    const servicesResult = await pool.query(`
      SELECT s.id, s.title, s.provider_id, s.price, s.category,
             sp.id as sp_id, sp.user_id as sp_user_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      LIMIT 3
    `);
    
    console.log(`Found ${servicesResult.rows.length} services:`);
    servicesResult.rows.forEach(s => {
      console.log(`  - Service ID: ${s.id}, Title: ${s.title}`);
      console.log(`    Provider User ID: ${s.provider_id}, SP ID: ${s.sp_id}, SP User ID: ${s.sp_user_id}`);
      console.log(`    Business: ${s.business_name || 'N/A'}`);
    });
    
    // Step 2: Check if we have any travelers
    console.log('\nStep 2: Checking available travelers...');
    const travelersResult = await pool.query(`
      SELECT id, email, first_name, last_name, role
      FROM users
      WHERE role = 'traveler'
      LIMIT 3
    `);
    
    console.log(`Found ${travelersResult.rows.length} travelers:`);
    travelersResult.rows.forEach(t => {
      console.log(`  - User ID: ${t.id}, Email: ${t.email}, Name: ${t.first_name} ${t.last_name}`);
    });
    
    // Step 3: Simulate booking creation
    if (servicesResult.rows.length > 0 && travelersResult.rows.length > 0) {
      const service = servicesResult.rows[0];
      const traveler = travelersResult.rows[0];
      
      console.log('\nStep 3: Simulating booking creation...');
      console.log(`  Service: ${service.title} (ID: ${service.id})`);
      console.log(`  Traveler: ${traveler.email} (ID: ${traveler.id})`);
      console.log(`  Provider SP ID: ${service.sp_id}`);
      
      if (!service.sp_id) {
        console.log('\n❌ ERROR: Service has no matching service_provider record!');
        console.log('   This is the root cause of the booking failure.');
        console.log('   services.provider_id =', service.provider_id);
        console.log('   But no service_providers record exists with user_id =', service.provider_id);
        
        // Check if provider exists
        const providerCheck = await pool.query(`
          SELECT id, user_id, business_name
          FROM service_providers
          WHERE user_id = $1
        `, [service.provider_id]);
        
        if (providerCheck.rows.length === 0) {
          console.log('\n🔧 SOLUTION: Need to create service_provider record for user_id:', service.provider_id);
        } else {
          console.log('\n✅ Provider exists:', providerCheck.rows[0]);
        }
      } else {
        console.log('\n✅ Service has valid provider reference');
        console.log('   Booking creation should work!');
      }
    }
    
    // Step 4: Check existing bookings
    console.log('\nStep 4: Checking existing bookings...');
    const bookingsResult = await pool.query(`
      SELECT id, user_id, service_id, provider_id, status, created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`Found ${bookingsResult.rows.length} recent bookings:`);
    bookingsResult.rows.forEach(b => {
      console.log(`  - Booking ID: ${b.id}, Status: ${b.status}, Provider ID: ${b.provider_id}`);
    });
    
    await pool.end();
    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPreOrderBooking();
