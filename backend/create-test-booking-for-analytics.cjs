const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createTestBooking() {
  try {
    console.log('🔍 Creating test booking for analytics...\n');
    
    // Get a provider
    const providerResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name
      FROM service_providers sp
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No providers found');
      return;
    }
    
    const provider = providerResult.rows[0];
    console.log('✅ Provider:', provider.business_name);
    
    // Get a service from this provider
    const serviceResult = await pool.query(`
      SELECT * FROM services 
      WHERE provider_id = $1
      LIMIT 1
    `, [provider.user_id]);
    
    if (serviceResult.rows.length === 0) {
      console.log('❌ No services found for this provider');
      return;
    }
    
    const service = serviceResult.rows[0];
    console.log('✅ Service:', service.title);
    
    // Get a user (traveler)
    const userResult = await pool.query(`
      SELECT * FROM users 
      WHERE user_type = 'traveler'
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No travelers found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ Traveler:', user.email);
    console.log('');
    
    // Create a test booking
    const bookingDate = new Date();
    const totalAmount = parseFloat(service.price) || 100;
    
    const result = await pool.query(`
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
        booking_details,
        service_title,
        service_description,
        service_images,
        service_location,
        business_name,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      user.id,
      service.id,
      provider.id,
      service.category || 'General',
      bookingDate,
      bookingDate,
      1,
      totalAmount,
      totalAmount,
      JSON.stringify({ test: true }),
      service.title,
      service.description || '',
      service.images || '[]',
      service.location || 'Tanzania',
      provider.business_name,
      'confirmed'
    ]);
    
    console.log('✅ Test booking created successfully!');
    console.log('Booking ID:', result.rows[0].id);
    console.log('Amount:', `$${result.rows[0].total_amount}`);
    console.log('Status:', result.rows[0].status);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
  }
}

createTestBooking();
