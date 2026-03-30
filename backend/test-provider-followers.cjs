require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./models');

async function testProviderFollowers() {
  try {
    console.log('🧪 Testing Provider Followers Issue\n');
    
    // 1. Check all users who are providers
    console.log('1️⃣ Checking users with provider records...');
    const providersResult = await pool.query(`
      SELECT u.id as user_id, u.email, u.user_type, sp.id as provider_id, sp.business_name
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE u.user_type = 'service_provider'
      ORDER BY u.id
    `);
    
    console.log('   Providers:');
    providersResult.rows.forEach(p => {
      console.log(`   - User ${p.user_id} (${p.email}): Provider ID ${p.provider_id} - ${p.business_name || 'NO PROVIDER RECORD'}`);
    });
    
    // 2. Check provider_followers table
    console.log('\n2️⃣ Checking provider_followers...');
    const followersResult = await pool.query(`
      SELECT pf.*, 
             sp.business_name as provider_name,
             u.email as follower_email
      FROM provider_followers pf
      LEFT JOIN service_providers sp ON pf.provider_id = sp.id
      LEFT JOIN users u ON pf.follower_id = u.id
    `);
    
    console.log('   Followers:');
    followersResult.rows.forEach(f => {
      console.log(`   - Provider ${f.provider_id} (${f.provider_name}) has follower ${f.follower_id} (${f.follower_email})`);
    });
    
    // 3. Test the my-followers query for a specific user
    console.log('\n3️⃣ Testing my-followers query for user_id = 3...');
    
    // First get provider_id for user 3
    const providerCheck = await pool.query(`
      SELECT id FROM service_providers WHERE user_id = $1
    `, [3]);
    
    if (providerCheck.rows.length > 0) {
      const providerId = providerCheck.rows[0].id;
      console.log(`   User 3 has provider_id: ${providerId}`);
      
      // Get followers for this provider
      const myFollowers = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, pf.followed_at
        FROM provider_followers pf
        JOIN users u ON pf.follower_id = u.id
        WHERE pf.provider_id = $1
        ORDER BY pf.followed_at DESC
      `, [providerId]);
      
      console.log(`   Followers for provider ${providerId}:`, myFollowers.rows.length);
      myFollowers.rows.forEach(f => {
        console.log(`   - ${f.first_name} ${f.last_name} (${f.email})`);
      });
    } else {
      console.log('   ⚠️ User 3 has NO provider record!');
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderFollowers();
