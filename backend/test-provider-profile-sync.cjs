const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderProfileSync() {
  try {
    console.log('🔍 Testing Provider Profile Data Sync...\n');

    // 1. Get all service providers
    const providersResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url, u.is_verified, u.phone as user_phone
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      ORDER BY sp.created_at DESC
      LIMIT 5
    `);

    console.log(`📊 Found ${providersResult.rows.length} service providers\n`);

    for (const provider of providersResult.rows) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Provider ID: ${provider.user_id}`);
      console.log(`Business Name: ${provider.business_name}`);
      console.log(`Email: ${provider.email}`);
      console.log(`First Name: ${provider.first_name}`);
      console.log(`Last Name: ${provider.last_name}`);
      console.log(`Phone (users table): ${provider.user_phone || 'Not set'}`);
      console.log(`Phone (service_providers table): ${provider.phone || 'Not set'}`);
      console.log(`Service Location: ${provider.service_location || 'Not set'}`);
      console.log(`Service Categories: ${JSON.stringify(provider.service_categories)}`);
      console.log(`Location Data: ${JSON.stringify(provider.location_data)}`);
      console.log(`Description: ${provider.description || 'Not set'}`);
      console.log(`Business Type: ${provider.business_type || 'Not set'}`);
      console.log(`Is Verified: ${provider.is_verified}`);
      console.log(`Created: ${provider.created_at}`);
      console.log(`Updated: ${provider.updated_at}`);
      console.log('');
    }

    // 2. Test specific provider fetch (like the API does)
    if (providersResult.rows.length > 0) {
      const testProviderId = providersResult.rows[0].user_id;
      console.log(`\n🔍 Testing API-style fetch for provider ${testProviderId}...\n`);

      const apiStyleResult = await pool.query(`
        SELECT sp.*, u.email, u.first_name, u.last_name, u.avatar_url, u.is_verified
        FROM service_providers sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.user_id = $1
      `, [testProviderId]);

      if (apiStyleResult.rows.length > 0) {
        const provider = apiStyleResult.rows[0];
        console.log('✅ Provider data fetched successfully:');
        console.log(JSON.stringify(provider, null, 2));
      }
    }

    // 3. Check if there are any recent updates
    console.log('\n\n🕐 Checking recent profile updates...\n');
    const recentUpdates = await pool.query(`
      SELECT sp.user_id, sp.business_name, sp.updated_at, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.updated_at > NOW() - INTERVAL '7 days'
      ORDER BY sp.updated_at DESC
    `);

    console.log(`📊 Found ${recentUpdates.rows.length} providers updated in the last 7 days:`);
    recentUpdates.rows.forEach(row => {
      console.log(`  - ${row.business_name} (${row.first_name} ${row.last_name}) - Updated: ${row.updated_at}`);
    });

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderProfileSync();
