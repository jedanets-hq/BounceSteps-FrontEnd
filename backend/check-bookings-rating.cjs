const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function checkBookingsRating() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Bookings table columns:');
    result.rows.forEach(row => {
      const marker = (row.column_name.includes('rating') || row.column_name.includes('review')) ? ' ⭐' : '';
      console.log(`  - ${row.column_name} (${row.data_type})${marker}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBookingsRating();
