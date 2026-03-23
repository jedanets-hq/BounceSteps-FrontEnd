const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function createTestBookings() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating test bookings for all providers...\n');
    
    // Get all providers with services
    const providers = await client.query(`
      SELECT DISTINCT 
        sp.id as sp_id,
        sp.user_id,
        sp.business_name,
        s.id as service_id,
        s.title as service_title,
        s.price
      FROM service_providers sp
      JOIN services s ON s.provider_id = sp.user_id
      WHERE s.is_active = true
    `);
    
    console.log(`Found ${providers.rows.length} providers with services`);
    
    // Get travelers
    const travelers = await client.query(`
      SELECT id, email, first_name, last_name
      FROM users
      LIMIT 5
    `);
    
    console.log(`Found ${travelers.rows.length} travelers\n`);
    
    // Create 2-3 bookings for each provider
    for (const provider of providers.rows) {
      console.log(`Creating bookings for ${provider.business_name}...`);
      
      const numBookings = Math.min(3, travelers.rows.length);
      const statuses = ['pending', 'confirmed', 'completed'];
      
      for (let i = 0; i < numBookings; i++) {
        const traveler = travelers.rows[i];
        const status = statuses[i % statuses.length];
        
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
            business_name,
            traveler_first_name,
            traveler_last_name
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING id
        `, [
          traveler.id,
          provider.service_id,
          provider.sp_id,
          'Safari',
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Future dates
          i + 1,
          parseFloat(provider.price) * (i + 1),
          parseFloat(provider.price) * (i + 1),
          status,
          provider.service_title,
          'Test booking for demonstration',
          'Tanzania',
          provider.business_name,
          traveler.first_name,
          traveler.last_name
        ]);
        
        console.log(`  ✅ Created ${status} booking ID ${booking.rows[0].id} for ${traveler.email}`);
      }
      
      console.log('');
    }
    
    console.log('✅ Test bookings created successfully!');
    console.log('\nNow login as a provider to see the bookings in the dashboard.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestBookings();
