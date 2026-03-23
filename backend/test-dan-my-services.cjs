const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function testDanMyServices() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== TESTING DAN MY SERVICES ENDPOINT ===\n');
    
    // Test for Dan user 1 (user_id = 4)
    console.log('1. Testing for Dan User 1 (user_id=4):');
    
    // Step 1: Get provider_id from user_id
    const provider1 = await client.query(
      'SELECT id FROM service_providers WHERE user_id = $1',
      [4]
    );
    console.log('   Provider ID:', provider1.rows[0]?.id);
    
    if (provider1.rows.length > 0) {
      const providerId = provider1.rows[0].id;
      
      // Step 2: Get services for this provider
      const services1 = await client.query(`
        SELECT s.*, 
               COUNT(DISTINCT b.id) as total_bookings
        FROM services s
        LEFT JOIN bookings b ON s.id = b.service_id
        WHERE s.provider_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `, [providerId]);
      
      console.log('   Services found:', services1.rows.length);
      services1.rows.forEach(s => {
        console.log(`     - ${s.title} (ID: ${s.id}, Active: ${s.is_active})`);
      });
    } else {
      console.log('   ❌ No provider profile found!');
    }
    
    // Test for Dan user 2 (user_id = 7)
    console.log('\n2. Testing for Dan User 2 (user_id=7):');
    
    // Step 1: Get provider_id from user_id
    const provider2 = await client.query(
      'SELECT id FROM service_providers WHERE user_id = $1',
      [7]
    );
    console.log('   Provider ID:', provider2.rows[0]?.id);
    
    if (provider2.rows.length > 0) {
      const providerId = provider2.rows[0].id;
      
      // Step 2: Get services for this provider
      const services2 = await client.query(`
        SELECT s.*, 
               COUNT(DISTINCT b.id) as total_bookings
        FROM services s
        LEFT JOIN bookings b ON s.id = b.service_id
        WHERE s.provider_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `, [providerId]);
      
      console.log('   Services found:', services2.rows.length);
      services2.rows.forEach(s => {
        console.log(`     - ${s.title} (ID: ${s.id}, Active: ${s.is_active})`);
      });
    } else {
      console.log('   ❌ No provider profile found!');
    }
    
    console.log('\n=== TEST COMPLETE ===\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDanMyServices();
