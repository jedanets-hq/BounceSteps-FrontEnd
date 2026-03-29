const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

const JWT_SECRET = 'your-local-jwt-secret-key-change-this-to-random-string';

async function testDanServicesAPI() {
  try {
    console.log('🔍 Testing Dan\'s services API...\n');
    
    // Get Dan's users
    const users = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, sp.id as provider_id, sp.business_name
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE u.email LIKE '%dan%'
      ORDER BY u.id
    `);
    
    console.log(`Found ${users.rows.length} Dan users:\n`);
    
    for (const user of users.rows) {
      console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);
      console.log(`   Provider ID: ${user.provider_id || 'NONE'}`);
      console.log(`   Business: ${user.business_name || 'NONE'}`);
      
      if (user.provider_id) {
        // Check services directly from database
        const dbServices = await pool.query(
          'SELECT id, title, category, is_active FROM services WHERE provider_id = $1',
          [user.provider_id]
        );
        
        console.log(`   \n   📦 Services in database: ${dbServices.rows.length}`);
        dbServices.rows.forEach(s => {
          console.log(`      - ${s.title} (${s.category}) - Active: ${s.is_active}`);
        });
        
        // Generate JWT token for this user
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
        
        // Test API endpoint
        const http = require('http');
        const apiResponse = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/services/provider/my-services',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve({ error: data });
              }
            });
          });

          req.on('error', reject);
          req.end();
        });
        
        console.log(`   \n   🌐 API Response:`);
        console.log(`      Success: ${apiResponse.success ? '✅' : '❌'}`);
        console.log(`      Services returned: ${apiResponse.services?.length || 0}`);
        if (apiResponse.services && apiResponse.services.length > 0) {
          apiResponse.services.forEach(s => {
            console.log(`         - ${s.title} (${s.category})`);
          });
        }
        if (!apiResponse.success) {
          console.log(`      Error: ${apiResponse.message || 'Unknown error'}`);
        }
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDanServicesAPI();
