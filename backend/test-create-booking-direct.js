const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 Testing booking creation directly\n');
    
    // Get a test user
    const users = await pool.query(`
      SELECT id, email FROM users WHERE user_type = 'traveler' LIMIT 1
    `);
    
    if (users.rows.length === 0) {
      console.log('❌ No traveler found');
      await pool.end();
      return;
    }
    
    const user = users.rows[0];
    console.log('👤 User:', user.email, '(ID:', user.id, ')');
    
    // Get a test service
    const services = await pool.query(`
      SELECT id, title, price, provider_id FROM services LIMIT 1
    `);
    
    if (services.rows.length === 0) {
      console.log('❌ No services found');
      await pool.end();
      return;
    }
    
    const service = services.rows[0];
    console.log('🎯 Service:', service.title, '(ID:', service.id, ')');
    console.log('   Provider ID:', service.provider_id);
    console.log('   Price:', service.price);
    
    // Create a booking directly in database
    console.log('\n📝 Creating booking...');
    const bookingData = {
      traveler_id: user.id,
      service_id: service.id,
      provider_id: service.provider_id,
      booking_date: new Date().toISOString().split('T')[0],
      participants: 2,
      total_amount: service.price * 2,
      status: 'pending',
      payment_status: 'pending'
    };
    
    console.log('   Data:', bookingData);
    
    const result = await pool.query(`
      INSERT INTO bookings (
        traveler_id, service_id, provider_id, booking_date, 
        participants, total_amount, status, payment_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      bookingData.traveler_id,
      bookingData.service_id,
      bookingData.provider_id,
      bookingData.booking_date,
      bookingData.participants,
      bookingData.total_amount,
      bookingData.status,
      bookingData.payment_status
    ]);
    
    console.log('\n✅ Booking created successfully!');
    console.log('   Booking ID:', result.rows[0].id);
    console.log('   Status:', result.rows[0].status);
    console.log('   Created at:', result.rows[0].created_at);
    
    // Verify it was saved
    console.log('\n🔍 Verifying booking...');
    const verify = await pool.query(`
      SELECT b.*, s.title as service_title, u.email as traveler_email
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.traveler_id = u.id
      WHERE b.id = $1
    `, [result.rows[0].id]);
    
    if (verify.rows.length > 0) {
      const booking = verify.rows[0];
      console.log('   ✅ Booking found in database');
      console.log('   Traveler:', booking.traveler_email);
      console.log('   Service:', booking.service_title);
      console.log('   Date:', booking.booking_date);
      console.log('   Participants:', booking.participants);
      console.log('   Total:', booking.total_amount);
    }
    
    // Check total bookings now
    console.log('\n📊 Total bookings in database:');
    const total = await pool.query('SELECT COUNT(*) FROM bookings');
    console.log('   Count:', total.rows[0].count);
    
    await pool.end();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
