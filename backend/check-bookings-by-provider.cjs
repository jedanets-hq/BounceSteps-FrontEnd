const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkBookings() {
  try {
    const result = await pool.query(`
      SELECT 
        sp.id as provider_id,
        sp.business_name,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as total_revenue
      FROM service_providers sp
      LEFT JOIN bookings b ON b.provider_id = sp.id
      GROUP BY sp.id, sp.business_name
      ORDER BY booking_count DESC
    `);
    
    console.log('Bookings by Provider:\n');
    result.rows.forEach(r => {
      console.log(`${r.business_name}:`);
      console.log(`  Provider ID: ${r.provider_id}`);
      console.log(`  Bookings: ${r.booking_count}`);
      console.log(`  Revenue: $${r.total_revenue || 0}`);
      console.log('');
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkBookings();
