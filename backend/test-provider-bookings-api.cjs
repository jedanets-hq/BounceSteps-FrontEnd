const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testProviderBookingsAPI() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTING PROVIDER BOOKINGS API...\n');
    
    // Step 1: Get a provider user who has services
    const provider = await client.query(`
      SELECT DISTINCT u.id, u.email, sp.id as sp_id, sp.business_name
      FROM users u
      JOIN service_providers sp ON u.id = sp.user_id
      JOIN services s ON s.provider_id = u.id
      WHERE s.is_active = true
      LIMIT 1
    `);
    
    if (provider.rows.length === 0) {
      console.log('❌ No provider found');
      return;
    }
    
    const providerUser = provider.rows[0];
    console.log(`Provider: ${providerUser.business_name} (user_id: ${providerUser.id})`);
    console.log('');
    
    // Step 2: Create a test booking for this provider
    const traveler = await client.query(`SELECT id FROM users WHERE id != $1 LIMIT 1`, [providerUser.id]);
    const service = await client.query(`
      SELECT s.id, s.title, s.price
      FROM services s
      WHERE s.provider_id = $1 AND s.is_active = true
      LIMIT 1
    `, [providerUser.id]);
    
    if (service.rows.length === 0) {
      console.log('❌ No service found for this provider');
      return;
    }
    
    console.log(`Creating test booking for service: ${service.rows[0].title}`);
    
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
        status,
        service_title,
        business_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      traveler.rows[0].id,
      service.rows[0].id,
      providerUser.sp_id,
      'Safari',
      new Date().toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
      2,
      parseFloat(service.rows[0].price) * 2,
      parseFloat(service.rows[0].price) * 2,
      'pending',
      service.rows[0].title,
      providerUser.business_name
    ]);
    
    console.log(`✅ Test booking created: ID ${booking.rows[0].id}`);
    console.log('');
    
    // Step 3: Test the API endpoint query
    console.log('Testing API endpoint query...');
    
    const apiQuery = await client.query(`
      SELECT 
        b.*,
        s.title as service_title,
        s.description as service_description,
        s.images as service_images,
        s.location as service_location,
        s.price as service_price,
        s.category as service_category,
        sp.business_name,
        sp.business_phone as provider_phone,
        sp.business_email as provider_email,
        u.first_name as traveler_first_name,
        u.last_name as traveler_last_name,
        u.email as traveler_email,
        u.phone as traveler_phone
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.provider_id = (SELECT id FROM service_providers WHERE user_id = $1)
      ORDER BY 
        CASE 
          WHEN b.status = 'pending' THEN 1
          WHEN b.status = 'confirmed' THEN 2
          WHEN b.status = 'completed' THEN 3
          ELSE 4
        END,
        b.created_at DESC
    `, [providerUser.id]);
    
    console.log(`✅ API query returned ${apiQuery.rows.length} booking(s)`);
    
    if (apiQuery.rows.length > 0) {
      console.log('\nSample booking data:');
      const sample = apiQuery.rows[0];
      console.log({
        id: sample.id,
        service_title: sample.service_title,
        status: sample.status,
        traveler_name: `${sample.traveler_first_name} ${sample.traveler_last_name}`,
        total_amount: sample.total_amount,
        created_at: sample.created_at
      });
    }
    
    // Step 4: Generate a JWT token for testing
    console.log('\n\nGenerating JWT token for API test...');
    const token = jwt.sign(
      { id: providerUser.id, email: providerUser.email },
      'your-local-jwt-secret-key-change-this-to-random-string',
      { expiresIn: '1h' }
    );
    
    console.log('\n📋 To test the API endpoint, run this curl command:');
    console.log(`\ncurl -X GET "http://localhost:5000/api/bookings/provider" \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    
    // Clean up
    console.log('\n\nCleaning up test booking...');
    await client.query('DELETE FROM bookings WHERE id = $1', [booking.rows[0].id]);
    console.log('✅ Test booking cleaned up');
    
    console.log('\n✅ TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testProviderBookingsAPI();
