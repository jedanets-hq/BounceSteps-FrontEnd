const { Pool } = require('pg');

// Use production database
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testServicesFix() {
  try {
    console.log('🧪 TESTING SERVICES FIX\n');
    
    // 1. Get a sample user who is a service provider
    console.log('1️⃣ Finding a service provider...');
    const providerQuery = await pool.query(`
      SELECT sp.id as sp_id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    
    if (providerQuery.rows.length === 0) {
      console.log('❌ No service providers found in database');
      return;
    }
    
    const provider = providerQuery.rows[0];
    console.log('✅ Found provider:', provider.business_name);
    console.log('   service_providers.id:', provider.sp_id);
    console.log('   user_id:', provider.user_id);
    
    // 2. Check services with OLD logic (using user_id)
    console.log('\n2️⃣ Checking services with OLD logic (provider_id = user_id)...');
    const oldLogicQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE provider_id = $1
    `, [provider.user_id]);
    console.log(`   Found ${oldLogicQuery.rows[0].count} services using user_id`);
    
    // 3. Check services with NEW logic (using service_providers.id)
    console.log('\n3️⃣ Checking services with NEW logic (provider_id = service_providers.id)...');
    const newLogicQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM services
      WHERE provider_id = $1
    `, [provider.sp_id]);
    console.log(`   Found ${newLogicQuery.rows[0].count} services using service_providers.id`);
    
    // 4. Check if services need migration
    console.log('\n4️⃣ Checking if migration is needed...');
    const needsMigration = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE sp.id IS NULL
    `);
    
    if (parseInt(needsMigration.rows[0].count) > 0) {
      console.log(`   ⚠️ ${needsMigration.rows[0].count} services need migration!`);
      console.log('   Run: node backend/fix-services-provider-id.cjs');
    } else {
      console.log('   ✅ All services have correct provider_id!');
    }
    
    // 5. Test the JOIN query (what backend uses)
    console.log('\n5️⃣ Testing JOIN query (what backend API uses)...');
    const joinQuery = await pool.query(`
      SELECT s.id, s.title, s.provider_id, sp.id as sp_id, sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.id
      WHERE sp.user_id = $1
      LIMIT 5
    `, [provider.user_id]);
    
    console.log(`   Found ${joinQuery.rows.length} services with correct JOIN`);
    if (joinQuery.rows.length > 0) {
      console.log('   Sample service:', joinQuery.rows[0].title);
      console.log('   ✅ JOIN is working correctly!');
    } else {
      console.log('   ❌ JOIN returned no results - migration needed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testServicesFix();
