const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testUpdateBookingStatus() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTING UPDATE BOOKING STATUS...\n');
    
    // Get a provider with a pending booking
    const booking = await client.query(`
      SELECT 
        b.id as booking_id,
        b.status,
        sp.user_id as provider_user_id,
        sp.id as provider_id,
        sp.business_name
      FROM bookings b
      JOIN service_providers sp ON b.provider_id = sp.id
      WHERE b.status = 'pending'
      LIMIT 1
    `);
    
    if (booking.rows.length === 0) {
      console.log('❌ No pending bookings found');
      return;
    }
    
    const b = booking.rows[0];
    console.log(`Found booking:`);
    console.log(`  Booking ID: ${b.booking_id}`);
    console.log(`  Status: ${b.status}`);
    console.log(`  Provider: ${b.business_name} (user_id: ${b.provider_user_id})`);
    console.log('');
    
    // Test the update query
    console.log('Testing update query...');
    
    // Step 1: Get provider_id
    const providerResult = await client.query(`
      SELECT id FROM service_providers WHERE user_id = $1
    `, [b.provider_user_id]);
    
    console.log(`Provider ID from query: ${providerResult.rows[0].id}`);
    
    // Step 2: Verify booking belongs to provider
    const checkResult = await client.query(`
      SELECT b.id, b.provider_id 
      FROM bookings b
      WHERE b.id = $1 AND b.provider_id = $2
    `, [b.booking_id, providerResult.rows[0].id]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Booking verification failed');
      return;
    }
    
    console.log('✅ Booking verified');
    
    // Step 3: Update status
    const result = await client.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, ['confirmed', b.booking_id]);
    
    console.log(`✅ Booking status updated to: confirmed`);
    console.log(`   Booking ID: ${result.rows[0].id}`);
    console.log(`   New status: ${result.rows[0].status}`);
    
    // Revert back to pending
    await client.query(`
      UPDATE bookings 
      SET status = $1
      WHERE id = $2
    `, ['pending', b.booking_id]);
    
    console.log('✅ Reverted back to pending');
    
    // Generate JWT token for API test
    console.log('\n\nGenerating JWT token for API test...');
    const token = jwt.sign(
      { id: b.provider_user_id },
      'your-local-jwt-secret-key-change-this-to-random-string',
      { expiresIn: '1h' }
    );
    
    console.log('\n📋 To test the API endpoint, run this curl command:');
    console.log(`\ncurl -X PATCH "http://localhost:5000/api/bookings/${b.booking_id}/status" \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"status":"confirmed"}'`);
    
    console.log('\n✅ TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testUpdateBookingStatus();
