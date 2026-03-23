const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testActualBookingIssue() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTING ACTUAL BOOKING ISSUE...\n');
    
    // Step 1: Check services and their provider relationships
    console.log('Step 1: Checking services and provider relationships...');
    const servicesCheck = await client.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id as service_provider_id,
        sp.id as sp_id,
        sp.user_id as sp_user_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.is_active = true
      LIMIT 5
    `);
    
    console.log(`Found ${servicesCheck.rows.length} services:`);
    servicesCheck.rows.forEach(s => {
      console.log(`  Service ID: ${s.service_id}, Title: ${s.title}`);
      console.log(`    services.provider_id (user_id): ${s.service_provider_id}`);
      console.log(`    service_providers.id: ${s.sp_id || 'NULL - PROBLEM!'}`);
      console.log(`    service_providers.user_id: ${s.sp_user_id || 'NULL'}`);
      console.log(`    Business: ${s.business_name || 'N/A'}`);
      console.log('');
    });
    
    // Check if any services have NULL sp_id
    const nullSpId = servicesCheck.rows.filter(s => !s.sp_id);
    if (nullSpId.length > 0) {
      console.log('❌ PROBLEM FOUND: Services without service_provider records:');
      nullSpId.forEach(s => {
        console.log(`  - Service "${s.title}" (ID: ${s.service_id}) has provider_id=${s.service_provider_id} but no matching service_providers record`);
      });
      console.log('');
    }
    
    // Step 2: Check travelers
    console.log('Step 2: Checking travelers...');
    const travelersCheck = await client.query(`
      SELECT id, email, first_name, last_name, role
      FROM users
      WHERE role = 'traveler'
      LIMIT 3
    `);
    
    console.log(`Found ${travelersCheck.rows.length} travelers:`);
    travelersCheck.rows.forEach(t => {
      console.log(`  - User ID: ${t.id}, Email: ${t.email}, Name: ${t.first_name} ${t.last_name}`);
    });
    console.log('');
    
    // Step 3: Check existing bookings
    console.log('Step 3: Checking existing bookings...');
    const bookingsCheck = await client.query(`
      SELECT 
        b.id,
        b.user_id,
        b.service_id,
        b.provider_id,
        b.status,
        b.created_at,
        s.title as service_title,
        sp.business_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${bookingsCheck.rows.length} recent bookings:`);
    bookingsCheck.rows.forEach(b => {
      console.log(`  - Booking ID: ${b.id}, Status: ${b.status}`);
      console.log(`    User ID: ${b.user_id}, Service ID: ${b.service_id}, Provider ID: ${b.provider_id}`);
      console.log(`    Service: ${b.service_title || 'N/A'}, Provider: ${b.business_name || 'N/A'}`);
      console.log('');
    });
    
    // Step 4: Check provider bookings query
    console.log('Step 4: Testing provider bookings query...');
    const providerUsers = await client.query(`
      SELECT DISTINCT user_id, business_name
      FROM service_providers
      LIMIT 3
    `);
    
    if (providerUsers.rows.length > 0) {
      const testProviderId = providerUsers.rows[0].user_id;
      console.log(`Testing with provider user_id: ${testProviderId} (${providerUsers.rows[0].business_name})`);
      
      const providerBookings = await client.query(`
        SELECT 
          b.*,
          s.title as service_title
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.provider_id = (SELECT id FROM service_providers WHERE user_id = $1)
        ORDER BY b.created_at DESC
      `, [testProviderId]);
      
      console.log(`Provider has ${providerBookings.rows.length} bookings`);
      if (providerBookings.rows.length > 0) {
        console.log('Sample bookings:');
        providerBookings.rows.slice(0, 3).forEach(b => {
          console.log(`  - Booking ID: ${b.id}, Service: ${b.service_title}, Status: ${b.status}`);
        });
      }
    }
    console.log('');
    
    // Step 5: Simulate booking creation
    console.log('Step 5: Simulating booking creation...');
    if (servicesCheck.rows.length > 0 && travelersCheck.rows.length > 0) {
      const service = servicesCheck.rows[0];
      const traveler = travelersCheck.rows[0];
      
      console.log(`Attempting to create booking:`);
      console.log(`  Service: ${service.title} (ID: ${service.service_id})`);
      console.log(`  Traveler: ${traveler.email} (ID: ${traveler.id})`);
      console.log(`  Provider SP ID: ${service.sp_id}`);
      
      if (!service.sp_id) {
        console.log('\n❌ BOOKING WILL FAIL: service.sp_id is NULL');
        console.log('   This means the service has no matching service_providers record');
        console.log('   Need to create service_provider record for user_id:', service.service_provider_id);
      } else {
        console.log('\n✅ Booking should succeed - service has valid provider reference');
        
        // Try to create a test booking
        try {
          await client.query('BEGIN');
          
          const testBooking = await client.query(`
            INSERT INTO bookings (
              user_id,
              service_id,
              provider_id,
              service_type,
              booking_date,
              travel_date,
              participants,
              total_amount,
              total_price,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `, [
            traveler.id,
            service.service_id,
            service.sp_id,
            'Test',
            new Date().toISOString().split('T')[0],
            new Date().toISOString().split('T')[0],
            1,
            100,
            100,
            'pending'
          ]);
          
          console.log(`✅ TEST BOOKING CREATED: ID ${testBooking.rows[0].id}`);
          
          // Clean up test booking
          await client.query('DELETE FROM bookings WHERE id = $1', [testBooking.rows[0].id]);
          console.log('✅ Test booking cleaned up');
          
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.log('❌ TEST BOOKING FAILED:', err.message);
        }
      }
    }
    
    console.log('\n✅ Diagnostic test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testActualBookingIssue();
