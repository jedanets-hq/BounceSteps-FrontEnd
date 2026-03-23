const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false // Disable SSL for local testing
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'isafari_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

async function diagnoseServiceVisibility() {
  try {
    console.log('🔍 DIAGNOSING SERVICE VISIBILITY ISSUE\n');
    console.log('=' .repeat(80));
    
    // 1. Check services table foreign key constraint
    console.log('\n1️⃣ CHECKING SERVICES TABLE FOREIGN KEY CONSTRAINT:');
    const fkResult = await pool.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'services'
        AND kcu.column_name = 'provider_id';
    `);
    
    if (fkResult.rows.length > 0) {
      console.log('✅ Foreign key found:');
      console.log(`   services.provider_id → ${fkResult.rows[0].foreign_table_name}.${fkResult.rows[0].foreign_column_name}`);
    } else {
      console.log('⚠️ No foreign key constraint found on services.provider_id');
    }
    
    // 2. Check sample services and their provider_id values
    console.log('\n2️⃣ CHECKING SAMPLE SERVICES:');
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, category, is_active
      FROM services
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${servicesResult.rows.length} services:`);
    servicesResult.rows.forEach(s => {
      console.log(`   Service #${s.id}: "${s.title}" | provider_id=${s.provider_id} | active=${s.is_active}`);
    });
    
    // 3. Check service_providers table
    console.log('\n3️⃣ CHECKING SERVICE_PROVIDERS TABLE:');
    const providersResult = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${providersResult.rows.length} providers:`);
    providersResult.rows.forEach(p => {
      console.log(`   Provider #${p.id}: "${p.business_name}" | user_id=${p.user_id}`);
    });
    
    // 4. Check if provider_id in services matches service_providers.id or users.id
    console.log('\n4️⃣ CHECKING PROVIDER_ID MATCHING:');
    
    // Check if services.provider_id matches service_providers.id
    const matchSPResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.id
    `);
    console.log(`   Services matching service_providers.id: ${matchSPResult.rows[0].count}`);
    
    // Check if services.provider_id matches users.id
    const matchUsersResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM services s
      INNER JOIN users u ON s.provider_id = u.id
    `);
    console.log(`   Services matching users.id: ${matchUsersResult.rows[0].count}`);
    
    // 5. Show specific example of mismatch
    console.log('\n5️⃣ DETAILED EXAMPLE:');
    const exampleResult = await pool.query(`
      SELECT 
        s.id as service_id,
        s.title,
        s.provider_id as service_provider_id,
        sp.id as sp_id,
        sp.user_id as sp_user_id,
        sp.business_name,
        u.id as user_id,
        u.email
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN users u ON s.provider_id = u.id
      LIMIT 1
    `);
    
    if (exampleResult.rows.length > 0) {
      const ex = exampleResult.rows[0];
      console.log(`   Service: "${ex.title}" (ID: ${ex.service_id})`);
      console.log(`   service.provider_id = ${ex.service_provider_id}`);
      console.log(`   Matches service_providers.id? ${ex.sp_id ? `YES (${ex.sp_id})` : 'NO'}`);
      console.log(`   Matches users.id? ${ex.user_id ? `YES (${ex.user_id})` : 'NO'}`);
      
      if (ex.sp_id) {
        console.log(`   ✅ Provider found via service_providers: ${ex.business_name}`);
      }
      if (ex.user_id) {
        console.log(`   ✅ User found via users: ${ex.email}`);
      }
    }
    
    // 6. Test the actual query used in providers.js
    console.log('\n6️⃣ TESTING PROVIDERS.JS QUERY:');
    const testProviderId = providersResult.rows[0]?.id;
    if (testProviderId) {
      console.log(`   Testing with service_providers.id = ${testProviderId}`);
      
      const testResult = await pool.query(`
        SELECT s.id, s.title, s.provider_id
        FROM services s
        WHERE s.provider_id = $1 AND s.is_active = true
      `, [testProviderId]);
      
      console.log(`   Result: Found ${testResult.rows.length} services`);
      if (testResult.rows.length > 0) {
        testResult.rows.forEach(s => {
          console.log(`      - ${s.title} (provider_id=${s.provider_id})`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNOSIS COMPLETE\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

diagnoseServiceVisibility();
