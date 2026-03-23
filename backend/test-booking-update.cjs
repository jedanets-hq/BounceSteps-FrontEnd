const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testBookingUpdate() {
  try {
    console.log('🔍 Testing booking update flow...\n');
    
    // Step 1: Get a service provider user
    console.log('Step 1: Finding service provider users...');
    const spUsers = await pool.query(`
      SELECT u.id as user_id, u.email, sp.id as provider_id, sp.business_name
      FROM users u
      INNER JOIN service_providers sp ON u.id = sp.user_id
      LIMIT 3
    `);
    
    if (spUsers.rows.length === 0) {
      console.log('❌ No service providers found');
      return;
    }
    
    console.log('✅ Found service providers:');
    spUsers.rows.forEach(sp => {
      console.log(`  - ${sp.email} (user_id: ${sp.user_id}, provider_id: ${sp.provider_id})`);
    });
    
    const testProvider = spUsers.rows[0];
    console.log(`\n📌 Using provider: ${testProvider.email}`);
    
    // Step 2: Get bookings for this provider
    console.log('\nStep 2: Finding bookings for this provider...');
    const bookings = await pool.query(`
      SELECT b.id, b.provider_id, b.status, b.service_title, b.total_amount,
             u.email as traveler_email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = $1
      ORDER BY b.created_at DESC
      LIMIT 5
    `, [testProvider.provider_id]);
    
    if (bookings.rows.length === 0) {
      console.log('❌ No bookings found for this provider');
      console.log('\nStep 3: Checking all bookings in database...');
      const allBookings = await pool.query(`
        SELECT b.id, b.provider_id, b.status, b.service_title,
               sp.id as sp_id, sp.user_id as sp_user_id, sp.business_name
        FROM bookings b
        LEFT JOIN service_providers sp ON b.provider_id = sp.id
        LIMIT 5
      `);
      
      console.log('All bookings:');
      allBookings.rows.forEach(b => {
        console.log(`  Booking ${b.id}: provider_id=${b.provider_id}, sp_id=${b.sp_id}, sp_user_id=${b.sp_user_id}, status=${b.status}`);
      });
      return;
    }
    
    console.log('✅ Found bookings:');
    bookings.rows.forEach(b => {
      console.log(`  - Booking ${b.id}: ${b.service_title} - ${b.status} (TSh ${b.total_amount})`);
    });
    
    // Step 3: Test the update logic
    const testBooking = bookings.rows[0];
    console.log(`\n📌 Testing update for booking ${testBooking.id}`);
    console.log(`   Current status: ${testBooking.status}`);
    
    // Simulate the backend logic
    console.log('\nStep 3: Simulating backend update logic...');
    
    // Get provider_id from service_providers table (like backend does)
    const providerResult = await pool.query(`
      SELECT id FROM service_providers WHERE user_id = $1
    `, [testProvider.user_id]);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ Provider not found in service_providers table');
      return;
    }
    
    const providerId = providerResult.rows[0].id;
    console.log(`✅ Provider ID from service_providers: ${providerId}`);
    
    // Verify the booking belongs to this provider
    const checkResult = await pool.query(`
      SELECT b.id, b.provider_id, b.status as current_status
      FROM bookings b
      WHERE b.id = $1 AND b.provider_id = $2
    `, [testBooking.id, providerId]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Booking verification failed!');
      console.log(`   Looking for: booking_id=${testBooking.id}, provider_id=${providerId}`);
      console.log(`   Actual booking provider_id: ${testBooking.provider_id}`);
      
      // Check if there's a mismatch
      if (testBooking.provider_id !== providerId) {
        console.log('\n⚠️  MISMATCH DETECTED!');
        console.log(`   Booking.provider_id (${testBooking.provider_id}) !== service_providers.id (${providerId})`);
        console.log('\n   This is the root cause of the issue!');
      }
    } else {
      console.log('✅ Booking verification passed!');
      console.log(`   Booking belongs to provider ${providerId}`);
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testBookingUpdate();
