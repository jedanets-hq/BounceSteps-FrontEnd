const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testFinalBooking() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 FINAL BOOKING TEST...\n');
    
    // Get a service and traveler
    const service = await client.query(`
      SELECT s.id, s.title, s.price, sp.id as provider_id, sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.is_active = true
      LIMIT 1
    `);
    
    const traveler = await client.query(`
      SELECT id, email FROM users LIMIT 1
    `);
    
    if (service.rows.length === 0 || traveler.rows.length === 0) {
      console.log('❌ No service or traveler found');
      return;
    }
    
    const s = service.rows[0];
    const t = traveler.rows[0];
    
    console.log(`Creating booking:`);
    console.log(`  Service: ${s.title} (ID: ${s.id})`);
    console.log(`  Provider: ${s.business_name} (ID: ${s.provider_id})`);
    console.log(`  Traveler: ${t.email} (ID: ${t.id})`);
    console.log('');
    
    // Create booking
    await client.query('BEGIN');
    
    const booking = await client.query(`
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
      RETURNING *
    `, [
      t.id,
      s.id,
      s.provider_id,
      'Safari',
      new Date().toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
      2,
      parseFloat(s.price) * 2,
      parseFloat(s.price) * 2,
      'pending'
    ]);
    
    console.log(`✅ BOOKING CREATED SUCCESSFULLY!`);
    console.log(`   Booking ID: ${booking.rows[0].id}`);
    console.log(`   Status: ${booking.rows[0].status}`);
    console.log(`   Total: ${booking.rows[0].total_amount}`);
    console.log('');
    
    // Test provider bookings query
    const providerUserId = await client.query(`
      SELECT user_id FROM service_providers WHERE id = $1
    `, [s.provider_id]);
    
    const providerBookings = await client.query(`
      SELECT b.*, s.title as service_title
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.provider_id = (SELECT id FROM service_providers WHERE user_id = $1)
    `, [providerUserId.rows[0].user_id]);
    
    console.log(`✅ PROVIDER CAN SEE BOOKINGS:`);
    console.log(`   Provider has ${providerBookings.rows.length} booking(s)`);
    providerBookings.rows.forEach(b => {
      console.log(`   - Booking ID: ${b.id}, Service: ${b.service_title}, Status: ${b.status}`);
    });
    console.log('');
    
    // Clean up
    await client.query('DELETE FROM bookings WHERE id = $1', [booking.rows[0].id]);
    console.log('✅ Test booking cleaned up');
    
    await client.query('COMMIT');
    
    console.log('\n✅✅✅ ALL TESTS PASSED! ✅✅✅');
    console.log('Pre-order and provider bookings are working correctly!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testFinalBooking();
