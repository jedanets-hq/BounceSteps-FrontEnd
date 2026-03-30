const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'isafari_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function testProviderRoute() {
  try {
    console.log('🧪 TESTING PROVIDER ROUTE LOGIC\n');
    console.log('='.repeat(80));
    
    // Test with different provider IDs
    const testIds = [1, 2, 3, 4, 5, 6, 7];
    
    for (const testId of testIds) {
      console.log(`\n📋 Testing with ID: ${testId}`);
      console.log('-'.repeat(40));
      
      // Step 1: Get provider details (mimicking providers.js line 48-53)
      const providerResult = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = $1 OR sp.user_id = $1
      `, [testId]);
      
      if (providerResult.rows.length === 0) {
        console.log(`   ❌ Provider not found for ID: ${testId}`);
        continue;
      }
      
      const provider = providerResult.rows[0];
      console.log(`   ✅ Provider found: ${provider.business_name}`);
      console.log(`      service_providers.id: ${provider.id}`);
      console.log(`      user_id: ${provider.user_id}`);
      
      // Step 2: Get services using provider.id (mimicking providers.js line 61-75)
      const servicesResult = await pool.query(`
        SELECT s.id,
               s.title,
               s.category,
               s.price,
               s.provider_id
        FROM services s
        WHERE s.provider_id = $1 AND s.is_active = true
        ORDER BY s.created_at DESC
      `, [provider.id]);
      
      console.log(`   📦 Services found: ${servicesResult.rows.length}`);
      if (servicesResult.rows.length > 0) {
        servicesResult.rows.forEach(s => {
          console.log(`      - ${s.title} (service.provider_id=${s.provider_id})`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testProviderRoute();
