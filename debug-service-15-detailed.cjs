require('dotenv').config({ path: './backend/.env' });
const {pool} = require('./backend/config/postgresql');

async function debugService15() {
  try {
    console.log('=== DEBUGGING SERVICE 15 ===\n');
    
    // 1. Check service
    const service = await pool.query('SELECT * FROM services WHERE id = 15');
    console.log('1. SERVICE DATA:');
    console.log(service.rows[0]);
    console.log('\n');
    
    const providerId = service.rows[0]?.provider_id;
    
    // 2. Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [providerId]);
    console.log('2. USER DATA (provider_id =', providerId, '):');
    if (user.rows.length > 0) {
      console.log(user.rows[0]);
    } else {
      console.log('❌ USER NOT FOUND');
    }
    console.log('\n');
    
    // 3. Check service_providers
    const sp = await pool.query('SELECT * FROM service_providers WHERE user_id = $1', [providerId]);
    console.log('3. SERVICE_PROVIDERS DATA (user_id =', providerId, '):');
    if (sp.rows.length > 0) {
      console.log(sp.rows[0]);
    } else {
      console.log('❌ SERVICE_PROVIDER RECORD NOT FOUND');
    }
    console.log('\n');
    
    // 4. Check what the booking query would return
    console.log('4. BOOKING QUERY RESULT:');
    const bookingQuery = await pool.query(`
      SELECT 
        s.*,
        sp.id as sp_id,
        sp.user_id as provider_user_id,
        sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.id = 15
    `);
    console.log(bookingQuery.rows[0]);
    console.log('\n');
    
    // 5. List ALL service_providers
    console.log('5. ALL SERVICE_PROVIDERS:');
    const allSP = await pool.query('SELECT id, user_id, business_name FROM service_providers ORDER BY id');
    allSP.rows.forEach(row => {
      console.log(`  ID: ${row.id}, User ID: ${row.user_id}, Business: ${row.business_name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

debugService15();
