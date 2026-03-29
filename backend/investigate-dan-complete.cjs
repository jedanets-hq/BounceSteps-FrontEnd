const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function investigateDan() {
  const client = await pool.connect();
  
  try {
    console.log('\n=== DEEP INVESTIGATION: DAN PROVIDER ===\n');
    
    // 1. Find all Dan users
    console.log('1. ALL DAN USERS:');
    const danUsers = await client.query(`
      SELECT * FROM users 
      WHERE email ILIKE '%dan%' OR first_name ILIKE '%dan%'
      ORDER BY id
    `);
    console.log(JSON.stringify(danUsers.rows, null, 2));
    
    // 2. Check service_providers for user_id 4 and 7 (Dan's IDs)
    console.log('\n2. SERVICE_PROVIDERS FOR DAN (user_id 4 and 7):');
    const danProviders = await client.query(`
      SELECT * FROM service_providers 
      WHERE user_id IN (4, 7)
      ORDER BY id
    `);
    console.log(JSON.stringify(danProviders.rows, null, 2));
    
    // 3. Check services table using provider_id (not service_provider_id)
    console.log('\n3. SERVICES FOR PROVIDER_ID 2 and 5:');
    const services = await client.query(`
      SELECT * FROM services 
      WHERE provider_id IN (2, 5)
      ORDER BY id
    `);
    console.log(JSON.stringify(services.rows, null, 2));
    
    // 4. Check if there's a mismatch - services with service_provider_id
    console.log('\n4. CHECKING IF SERVICES TABLE HAS service_provider_id COLUMN:');
    const servicesColumns = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'services' AND column_name LIKE '%provider%'
    `);
    console.log(servicesColumns.rows);
    
    // 5. Full relationship check
    console.log('\n5. FULL RELATIONSHIP CHECK:');
    const fullCheck = await client.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.user_type,
        u.is_active as user_active,
        sp.id as provider_id,
        sp.business_name,
        COUNT(s.id) as service_count
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      LEFT JOIN services s ON sp.id = s.provider_id
      WHERE u.id IN (4, 7)
      GROUP BY u.id, u.email, u.first_name, u.user_type, u.is_active, sp.id, sp.business_name
      ORDER BY u.id
    `);
    console.log(JSON.stringify(fullCheck.rows, null, 2));
    
    // 6. Check what API would return for provider ID 2
    console.log('\n6. API SIMULATION FOR PROVIDER ID 2:');
    const apiCheck = await client.query(`
      SELECT 
        sp.*,
        u.email,
        u.first_name,
        u.last_name,
        (SELECT COUNT(*) FROM services WHERE provider_id = sp.id) as service_count
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.id = 2
    `);
    console.log(JSON.stringify(apiCheck.rows, null, 2));
    
    // 7. Check what API would return for provider ID 5
    console.log('\n7. API SIMULATION FOR PROVIDER ID 5:');
    const apiCheck5 = await client.query(`
      SELECT 
        sp.*,
        u.email,
        u.first_name,
        u.last_name,
        (SELECT COUNT(*) FROM services WHERE provider_id = sp.id) as service_count
      FROM service_providers sp
      LEFT JOIN users u ON sp.user_id = u.id
      WHERE sp.id = 5
    `);
    console.log(JSON.stringify(apiCheck5.rows, null, 2));
    
    console.log('\n=== INVESTIGATION COMPLETE ===\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

investigateDan();
