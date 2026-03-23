const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testBookingCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 TESTING BOOKING CREATION\n');
    
    // Get a test service with provider
    const serviceResult = await client.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.price,
        s.category,
        sp.user_id as provider_id,
        sp.business_name
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      LIMIT 1
    `);
    
    if (serviceResult.rows.length === 0) {
      console.log('❌ No services with providers found');
      return;
    }
    
    const service = serviceResult.rows[0];
    console.log('✅ Found test service:');
    console.log(`   Service ID: ${service.service_id}`);
    console.log(`   Title: ${service.title}`);
    console.log(`   Provider ID: ${service.provider_id}`);
    console.log(`   Business: ${service.business_name}`);
    
    // Get a test traveler
    const travelerResult = await client.query(`
      SELECT id, first_name, last_name, email
      FROM users
      WHERE user_type = 'traveler'
      LIMIT 1
    `);
    
    if (travelerResult.rows.length === 0) {
      console.log('❌ No travelers found');
      return;
    }
    
    const traveler = travelerResult.rows[0];
    console.log('\n✅ Found test traveler:');
    console.log(`   User ID: ${traveler.id}`);
    console.log(`   Name: ${traveler.first_name} ${traveler.last_name}`);
    
    // Test booking creation
    console.log('\n📝 Creating test booking...');
    
    const bookingDate = new Date().toISOString();
    const participants = 2;
    const totalAmount = parseFloat(service.price) * participants;
    
    const result = await client.query(`
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
        service_title,
        business_name,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      traveler.id,
      service.service_id,
      service.provider_id,
      service.category || 'General',
      bookingDate,
      bookingDate,
      participants,
      totalAmount,
      totalAmount,
      service.title,
      service.business_name,
      'pending'
    ]);
    
    console.log('✅ BOOKING CREATED SUCCESSFULLY!');
    console.log(`   Booking ID: ${result.rows[0].id}`);
    console.log(`   Status: ${result.rows[0].status}`);
    console.log(`   Total: ${result.rows[0].total_amount}`);
    
    // Clean up test booking
    await client.query('DELETE FROM bookings WHERE id = $1', [result.rows[0].id]);
    console.log('\n🧹 Test booking cleaned up');
    
    console.log('\n✅ BOOKING CREATION TEST PASSED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testBookingCreation();
