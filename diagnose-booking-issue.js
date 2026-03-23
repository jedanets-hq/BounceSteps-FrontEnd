const { pool } = require('./backend/config/postgresql');

async function checkDatabase() {
  try {
    console.log('🔍 Checking service_providers table...\n');
    
    // Check service_providers table structure and data
    const spResult = await pool.query(`
      SELECT id, user_id, business_name, business_phone, business_email 
      FROM service_providers 
      LIMIT 5
    `);
    console.log('Service Providers:', JSON.stringify(spResult.rows, null, 2));
    
    console.log('\n🔍 Checking services table...\n');
    
    // Check services table and their provider_id values
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, category, price 
      FROM services 
      LIMIT 5
    `);
    console.log('Services:', JSON.stringify(servicesResult.rows, null, 2));
    
    console.log('\n🔍 Checking if services.provider_id matches service_providers records...\n');
    
    // Check for mismatched provider_ids
    const mismatchResult = await pool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id as service_provider_id,
        sp.id as actual_sp_id,
        sp.user_id as sp_user_id
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE sp.id IS NULL
      LIMIT 10
    `);
    
    if (mismatchResult.rows.length > 0) {
      console.log('❌ Services with invalid provider_id (not matching any service_providers.user_id):');
      console.log(JSON.stringify(mismatchResult.rows, null, 2));
    } else {
      console.log('✅ All services have valid provider_id references');
    }
    
    console.log('\n🔍 Checking bookings table...\n');
    
    // Check recent bookings
    const bookingsResult = await pool.query(`
      SELECT id, user_id, service_id, provider_id, status, created_at 
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.log('Recent Bookings:', JSON.stringify(bookingsResult.rows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database check error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDatabase();
