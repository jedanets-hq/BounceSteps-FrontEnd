const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://isafari_user:@Jctnftr01@dpg-cu0rvf08fa8c73a0rvog-a.oregon-postgres.render.com/isafari_db'
});

async function checkSchema() {
  try {
    console.log('🔍 Checking bookings table schema...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position
    `);
    
    console.log('Bookings table columns:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🔍 Checking service_providers table...\n');
    
    const spResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'service_providers' 
      ORDER BY ordinal_position
    `);
    
    console.log('Service_providers table columns:');
    spResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🔍 Checking sample booking data...\n');
    
    const bookingData = await pool.query(`
      SELECT b.id, b.provider_id, b.status, sp.id as sp_id, sp.user_id as sp_user_id
      FROM bookings b
      LEFT JOIN service_providers sp ON b.provider_id = sp.id
      LIMIT 3
    `);
    
    console.log('Sample bookings:');
    bookingData.rows.forEach(b => {
      console.log(`  Booking ${b.id}: provider_id=${b.provider_id}, status=${b.status}, sp_id=${b.sp_id}, sp_user_id=${b.sp_user_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
