const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderAPIResponse() {
  try {
    console.log('🔍 Testing Provider API Response (simulating backend route)...\n');

    // Get first provider
    const providersResult = await pool.query(`
      SELECT sp.user_id
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = true
      LIMIT 1
    `);

    if (providersResult.rows.length === 0) {
      console.log('❌ No providers found');
      return;
    }

    const providerId = providersResult.rows[0].user_id;
    console.log(`📋 Testing provider ID: ${providerId}\n`);

    // Simulate the API call (GET /providers/:id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Simulating GET /providers/:id API call');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const providerResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [providerId]);

    if (providerResult.rows.length === 0) {
      console.log('❌ Provider not found');
      return;
    }

    const provider = providerResult.rows[0];

    console.log('✅ API Response Data:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Provider Information:');
    console.log(`  User ID: ${provider.user_id}`);
    console.log(`  Business Name: ${provider.business_name}`);
    console.log(`  Email: ${provider.email}`);
    console.log(`  First Name: ${provider.first_name}`);
    console.log(`  Last Name: ${provider.last_name}`);
    console.log(`  Phone (from users table): ${provider.phone || 'Not set'}`);
    console.log(`  Phone (from service_providers table): ${provider.phone || 'Not set'}`);
    console.log(`  Avatar URL: ${provider.avatar_url || 'Not set'}`);
    console.log(`  Is Verified: ${provider.is_verified}`);
    console.log(`  Service Location: ${provider.service_location || 'Not set'}`);
    console.log(`  Service Categories: ${JSON.stringify(provider.service_categories)}`);
    console.log(`  Location Data: ${JSON.stringify(provider.location_data)}`);
    console.log(`  Description: ${provider.description || 'Not set'}`);
    console.log(`  Business Type: ${provider.business_type || 'Not set'}`);
    console.log(`  Created: ${provider.created_at}`);
    console.log(`  Updated: ${provider.updated_at}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ This is what the traveller portal will see!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if phone is available
    if (provider.phone) {
      console.log('✅ Phone number IS included in API response');
    } else {
      console.log('❌ Phone number is NOT included in API response');
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderAPIResponse();
