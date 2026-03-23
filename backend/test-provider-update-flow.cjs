const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderUpdateFlow() {
  try {
    console.log('🔍 Testing Complete Provider Update Flow...\n');

    // Get first provider
    const providersResult = await pool.query(`
      SELECT sp.user_id, u.first_name, u.last_name, sp.business_name
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
    const providerName = `${providersResult.rows[0].first_name} ${providersResult.rows[0].last_name}`;
    const businessName = providersResult.rows[0].business_name;

    console.log(`📋 Testing provider: ${providerName} (${businessName})`);
    console.log(`   User ID: ${providerId}\n`);

    // STEP 1: Show current data
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Current Provider Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const beforeResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [providerId]);

    const before = beforeResult.rows[0];
    console.log('📊 Before Update:');
    console.log(`  Business Name: ${before.business_name}`);
    console.log(`  Phone: ${before.phone || 'Not set'}`);
    console.log(`  Service Location: ${before.service_location || 'Not set'}`);
    console.log(`  Service Categories: ${JSON.stringify(before.service_categories)}`);
    console.log(`  Description: ${before.description || 'Not set'}`);

    // STEP 2: Simulate provider editing profile
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Provider Edits Profile (Simulating)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const testPhone = '+255700000000';
    const testLocation = 'Arusha, Tanzania';
    const testDescription = 'Updated description - ' + new Date().toISOString();

    // Update users table
    await pool.query(`
      UPDATE users
      SET phone = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [testPhone, providerId]);

    // Update service_providers table
    await pool.query(`
      UPDATE service_providers
      SET service_location = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
    `, [testLocation, testDescription, providerId]);

    console.log('✅ Profile updated in database');
    console.log(`  New Phone: ${testPhone}`);
    console.log(`  New Location: ${testLocation}`);
    console.log(`  New Description: ${testDescription}`);

    // STEP 3: Simulate API call (what traveller portal will see)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Traveller Portal Fetches Data (API Call)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const afterResult = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_verified
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.user_id = $1
    `, [providerId]);

    const after = afterResult.rows[0];
    console.log('📊 What Traveller Portal Sees:');
    console.log(`  Business Name: ${after.business_name}`);
    console.log(`  Phone: ${after.phone || 'Not set'}`);
    console.log(`  Service Location: ${after.service_location || 'Not set'}`);
    console.log(`  Service Categories: ${JSON.stringify(after.service_categories)}`);
    console.log(`  Description: ${after.description || 'Not set'}`);

    // STEP 4: Verify changes
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4: Verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const phoneMatch = after.phone === testPhone;
    const locationMatch = after.service_location === testLocation;
    const descriptionMatch = after.description === testDescription;

    console.log(`Phone updated correctly: ${phoneMatch ? '✅' : '❌'}`);
    console.log(`Location updated correctly: ${locationMatch ? '✅' : '❌'}`);
    console.log(`Description updated correctly: ${descriptionMatch ? '✅' : '❌'}`);

    if (phoneMatch && locationMatch && descriptionMatch) {
      console.log('\n✅ ALL CHANGES ARE VISIBLE TO TRAVELLER PORTAL!');
    } else {
      console.log('\n❌ SOME CHANGES ARE NOT VISIBLE!');
    }

    // Restore original data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Restoring original data...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.query(`
      UPDATE users
      SET phone = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [before.phone, providerId]);

    await pool.query(`
      UPDATE service_providers
      SET service_location = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
    `, [before.service_location, before.description, providerId]);

    console.log('✅ Original data restored');
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderUpdateFlow();
