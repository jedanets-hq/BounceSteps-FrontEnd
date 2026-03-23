require('dotenv').config({ path: './backend/.env' });
const {pool} = require('./backend/config/postgresql');

async function checkService() {
  try {
    // Check service 15
    const serviceResult = await pool.query(`
      SELECT id, title, provider_id, category, location 
      FROM services 
      WHERE id = 15
    `);
    
    console.log('Service 15:');
    console.log(serviceResult.rows[0]);
    
    if (serviceResult.rows.length > 0) {
      const providerId = serviceResult.rows[0].provider_id;
      console.log('\nProvider ID from service:', providerId);
      
      // Check if provider exists in service_providers
      const providerResult = await pool.query(`
        SELECT id, user_id, business_name 
        FROM service_providers 
        WHERE user_id = $1
      `, [providerId]);
      
      console.log('\nProvider in service_providers table:');
      if (providerResult.rows.length > 0) {
        console.log(providerResult.rows[0]);
      } else {
        console.log('❌ Provider NOT FOUND in service_providers table!');
        
        // Check if user exists
        const userResult = await pool.query(`
          SELECT id, email, user_type 
          FROM users 
          WHERE id = $1
        `, [providerId]);
        
        console.log('\nUser in users table:');
        if (userResult.rows.length > 0) {
          console.log(userResult.rows[0]);
          console.log('\n✅ User exists but missing service_providers record');
        } else {
          console.log('❌ User does NOT exist!');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkService();
