const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testProviderBookings() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTING PROVIDER BOOKINGS...\n');
    
    // Step 1: Create test bookings for providers
    console.log('Step 1: Creating test bookings...');
    
    const providers = await client.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 2
    `);
    
    const travelers = await client.query(`
      SELECT id, email FROM users LIMIT 2
    `);
    
    const services = await client.query(`
      SELECT s.id, s.title, s.price, s.provider_id, sp.id as sp_id
      FROM services s
      JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.is_active = true
      LIMIT 3
    `);
    
    console.log(`Found ${providers.rows.length} providers`);
    console.log(`Found ${travelers.rows.length} travelers`);
    console.log(`Found ${services.rows.length} services`);
    console.log('');
    
    // Create test bookings
    const bookingIds = [];
    for (let i = 0; i < Math.min(3, services.rows.length); i++) {
      const service = services.rows[i];
      const traveler = travelers.rows[i % travelers.rows.length];
      
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
          service_description,
          service_location,
          business_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `, [
        traveler.id,
        service.id,
        service.sp_id,
        'Safari',
        new Date().toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        2,
        parseFloat(service.price) * 2,
        parseFloat(service.price) * 2,
        i === 0 ? 'pending' : i === 1 ? 'confirmed' : 'completed',
        service.title,
        'Test booking description',
        'Tanzania',
        'Test Provider'
      ]);
      
      bookingIds.push(booking.rows[0].id);
      console.log(`✅ Created booking ID ${booking.rows[0].id} for service "${service.title}"`);
    }
    
    console.log('');
    
    // Step 2: Test provider bookings query for each provider
    console.log('Step 2: Testing provider bookings query...');
    
    for (const provider of providers.rows) {
      console.log(`\nProvider: ${provider.business_name} (user_id: ${provider.user_id})`);
      
      const bookings = await client.query(`
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
      `, [provider.user_id]);
      
      console.log(`  Found ${bookings.rows.length} bookings`);
      
      if (bookings.rows.length > 0) {
        bookings.rows.forEach(b => {
          console.log(`    - Booking ID: ${b.id}`);
          console.log(`      Service: ${b.service_title || 'N/A'}`);
          console.log(`      Status: ${b.status}`);
          console.log(`      Traveler: ${b.traveler_email || 'N/A'}`);
          console.log(`      Total: ${b.total_amount}`);
        });
      } else {
        console.log('    ❌ No bookings found for this provider');
      }
    }
    
    // Step 3: Check if bookings are visible via API endpoint simulation
    console.log('\n\nStep 3: Simulating API endpoint...');
    
    const testProviderId = providers.rows[0].user_id;
    console.log(`Testing with provider user_id: ${testProviderId}`);
    
    const apiResult = await client.query(`
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
    `, [testProviderId]);
    
    console.log(`\n✅ API would return ${apiResult.rows.length} bookings`);
    console.log('Sample response:');
    console.log(JSON.stringify(apiResult.rows.slice(0, 1), null, 2));
    
    // Clean up
    console.log('\n\nCleaning up test bookings...');
    for (const id of bookingIds) {
      await client.query('DELETE FROM bookings WHERE id = $1', [id]);
    }
    console.log('✅ Test bookings cleaned up');
    
    console.log('\n✅ TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testProviderBookings();
