const { pool } = require('./models');

async function deepDebug() {
  try {
    console.log('🔍 DEEP DEBUGGING SERVICES ISSUE\n');
    
    // 1. Check if services table exists and has data
    console.log('1️⃣ Checking services table...');
    const servicesCheck = await pool.query(`
      SELECT COUNT(*) as count FROM services
    `);
    console.log(`   Total services: ${servicesCheck.rows[0].count}`);
    
    if (servicesCheck.rows[0].count === '0') {
      console.log('   ❌ NO SERVICES IN DATABASE!');
      console.log('   This is why nothing appears.');
      return;
    }
    
    // 2. Check service_providers table
    console.log('\n2️⃣ Checking service_providers table...');
    const providersCheck = await pool.query(`
      SELECT COUNT(*) as count FROM service_providers
    `);
    console.log(`   Total providers: ${providersCheck.rows[0].count}`);
    
    // 3. Check the actual data - sample service
    console.log('\n3️⃣ Checking sample service data...');
    const sampleService = await pool.query(`
      SELECT id, title, provider_id, is_active, status
      FROM services
      LIMIT 1
    `);
    if (sampleService.rows.length > 0) {
      console.log('   Sample service:', sampleService.rows[0]);
    }
    
    // 4. Check sample provider
    console.log('\n4️⃣ Checking sample provider data...');
    const sampleProvider = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      LIMIT 1
    `);
    if (sampleProvider.rows.length > 0) {
      console.log('   Sample provider:', sampleProvider.rows[0]);
    }
    
    // 5. THE CRITICAL CHECK - Do provider_ids match?
    console.log('\n5️⃣ CRITICAL: Checking provider_id relationships...');
    const relationshipCheck = await pool.query(`
      SELECT 
        s.id as service_id,
        s.provider_id as service_provider_id,
        sp.id as sp_table_id,
        sp.user_id as sp_user_id,
        CASE 
          WHEN s.provider_id = sp.id THEN 'MATCH (correct)'
          WHEN s.provider_id = sp.user_id THEN 'MATCH user_id (WRONG!)'
          ELSE 'NO MATCH'
        END as relationship_status
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN service_providers sp2 ON s.provider_id = sp2.user_id
      LIMIT 5
    `);
    console.log('   Relationship check:');
    relationshipCheck.rows.forEach(row => {
      console.log(`   Service ${row.service_id}: provider_id=${row.service_provider_id}, sp.id=${row.sp_table_id}, sp.user_id=${row.sp_user_id}`);
      console.log(`   Status: ${row.relationship_status}`);
    });
    
    // 6. Count mismatches
    console.log('\n6️⃣ Counting ID mismatches...');
    const mismatchCount = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE sp.id IS NOT NULL) as correct_matches,
        COUNT(*) FILTER (WHERE sp.id IS NULL AND sp2.id IS NOT NULL) as wrong_matches,
        COUNT(*) FILTER (WHERE sp.id IS NULL AND sp2.id IS NULL) as orphaned
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LEFT JOIN service_providers sp2 ON s.provider_id = sp2.user_id
    `);
    console.log('   Results:', mismatchCount.rows[0]);
    
    const { correct_matches, wrong_matches, orphaned } = mismatchCount.rows[0];
    
    if (wrong_matches > 0) {
      console.log(`\n   ⚠️ FOUND THE PROBLEM!`);
      console.log(`   ${wrong_matches} services are using user_id instead of service_providers.id`);
      console.log(`   This is why they don't appear - the JOIN fails!`);
    }
    
    if (orphaned > 0) {
      console.log(`\n   ⚠️ ALSO FOUND: ${orphaned} orphaned services (no provider at all)`);
    }
    
    // 7. Test the actual query used by the API
    console.log('\n7️⃣ Testing actual API query...');
    const apiQuery = await pool.query(`
      SELECT s.*, 
             sp.id as service_provider_id,
             sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.status = 'active' AND s.is_active = true
      LIMIT 5
    `);
    console.log(`   API query returned: ${apiQuery.rows.length} services`);
    
    if (apiQuery.rows.length === 0) {
      console.log('   ❌ API query returns NOTHING - this is the bug!');
    } else {
      console.log('   ✅ API query works - services should appear');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

deepDebug();
