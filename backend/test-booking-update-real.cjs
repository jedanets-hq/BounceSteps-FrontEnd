const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testBookingUpdate() {
  try {
    console.log('🔍 Testing booking update with real provider...\n');
    
    // Use provider with bookings (user_id: 4, provider_id: 2)
    const userId = 4;
    const bookingId = 18; // pending booking
    const newStatus = 'confirmed';
    
    console.log(`Testing update for:`);
    console.log(`  User ID: ${userId}`);
    console.log(`  Booking ID: ${bookingId}`);
    console.log(`  New Status: ${newStatus}\n`);
    
    // Step 1: Get provider_id from service_providers table
    console.log('Step 1: Getting provider_id...');
    const providerResult = await pool.query(`
      SELECT id FROM service_providers WHERE user_id = $1
    `, [userId]);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ User is not a service provider');
      return;
    }
    
    const providerId = providerResult.rows[0].id;
    console.log(`✅ Provider ID: ${providerId}\n`);
    
    // Step 2: Verify the booking belongs to this provider
    console.log('Step 2: Verifying booking ownership...');
    const checkResult = await pool.query(`
      SELECT b.id, b.provider_id, b.status as current_status
      FROM bookings b
      WHERE b.id = $1 AND b.provider_id = $2
    `, [bookingId, providerId]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Booking not found or not owned by provider');
      console.log(`   Looking for: booking_id=${bookingId}, provider_id=${providerId}`);
      
      // Check what the actual provider_id is
      const actualBooking = await pool.query(`
        SELECT id, provider_id, status FROM bookings WHERE id = $1
      `, [bookingId]);
      
      if (actualBooking.rows.length > 0) {
        console.log(`   Actual booking provider_id: ${actualBooking.rows[0].provider_id}`);
      }
      return;
    }
    
    console.log(`✅ Booking verified!`);
    console.log(`   Current status: ${checkResult.rows[0].current_status}\n`);
    
    // Step 3: Update the booking status
    console.log('Step 3: Updating booking status...');
    const result = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [newStatus, bookingId]);
    
    console.log(`✅ Booking status updated!`);
    console.log(`   New status: ${result.rows[0].status}`);
    console.log(`   Updated at: ${result.rows[0].updated_at}\n`);
    
    console.log('✅ Test successful! The update logic works correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testBookingUpdate();
