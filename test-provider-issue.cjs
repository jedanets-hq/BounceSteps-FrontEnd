const { pool } = require('./backend/models');

async function testProviderIssue() {
  try {
    console.log('🔍 Testing Provider Issue...\n');
    
    // 1. Get a sample provider from service_providers table
    console.log('1️⃣ Fetching sample provider from service_providers...');
    const providerResult = await pool.query(`
      SELECT sp.id, sp.user_id, sp.business_name, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    
    if (providerResult.rows.length === 0) {
      console.log('❌ No providers found in database!');
      return;
    }
    
    const provider = providerResult.rows[0];
    console.log(`✅ Found provider: ${provider.business_name}`);
    console.log(`   - service_providers.id: ${provider.id}`);
    console.log(`   - service_providers.user_id: ${provider.user_id}`);
    console.log(`   - Email: ${provider.email}\n`);
    
    // 2. Check services for this provider
    console.log('2️⃣ Checking services for this provider...');
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, category
      FROM services
      WHERE provider_id = $1 AND is_active = true
    `, [provider.user_id]);
    
    console.log(`✅ Found ${servicesResult.rows.length} services for provider_id = ${provider.user_id}`);
    if (servicesResult.rows.length > 0) {
      servicesResult.rows.forEach(s => {
        console.log(`   - Service: ${s.title} (ID: ${s.id}, Category: ${s.category})`);
      });
    }
    console.log('');
    
    // 3. Test the CURRENT query (which is WRONG)
    console.log('3️⃣ Testing CURRENT query (WRONG - using user_id as parameter)...');
    const wrongQuery = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [provider.user_id]);
    
    console.log(`   Result: ${wrongQuery.rows.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (wrongQuery.rows.length > 0) {
      console.log(`   This works when providerId = user_id = ${provider.user_id}\n`);
    }
    
    // 4. Test what happens when we use service_providers.id
    console.log('4️⃣ Testing with service_providers.id (what frontend might send)...');
    const wrongQuery2 = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [provider.id]);  // Using sp.id instead of user_id
    
    console.log(`   Result: ${wrongQuery2.rows.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (wrongQuery2.rows.length === 0) {
      console.log(`   ❌ This FAILS when providerId = service_providers.id = ${provider.id}\n`);
    }
    
    // 5. Show the CORRECT query
    console.log('5️⃣ CORRECT query (should work with BOTH IDs)...');
    console.log('   Option A: Use sp.id OR sp.user_id');
    const correctQuery = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [provider.user_id]);
    
    console.log(`   Result with user_id: ${correctQuery.rows.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    const correctQuery2 = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1 OR sp.user_id = $1
    `, [provider.id]);
    
    console.log(`   Result with sp.id: ${correctQuery2.rows.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    console.log('\n📊 SUMMARY:');
    console.log('   The issue is that the query uses sp.user_id = $1');
    console.log('   But the frontend might be sending service_providers.id');
    console.log('   Solution: Change query to: WHERE sp.id = $1 OR sp.user_id = $1');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

testProviderIssue();
