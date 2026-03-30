import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://isafari_user:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testFollowersIssue() {
  try {
    console.log('🔍 Testing Provider Followers Issue...\n');

    // 1. Check if provider_followers table exists
    console.log('1️⃣ Checking provider_followers table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provider_followers'
      );
    `);
    console.log('   Table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('   ❌ Table does not exist! Creating it...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_followers (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider_id, follower_id)
        );
      `);
      console.log('   ✅ Table created successfully');
    }

    // 2. Get all service providers
    console.log('\n2️⃣ Getting all service providers...');
    const providers = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, sp.business_name
      FROM users u
      LEFT JOIN service_providers sp ON u.id = sp.user_id
      WHERE u.user_type = 'service_provider'
      ORDER BY u.id
    `);
    console.log(`   Found ${providers.rows.length} providers:\n`);
    
    for (const provider of providers.rows) {
      console.log(`   📋 Provider ID: ${provider.id}`);
      console.log(`      Name: ${provider.first_name} ${provider.last_name}`);
      console.log(`      Email: ${provider.email}`);
      console.log(`      Business: ${provider.business_name || 'N/A'}`);
      
      // Get followers count for this provider
      const followersCount = await pool.query(`
        SELECT COUNT(*) as count FROM provider_followers WHERE provider_id = $1
      `, [provider.id]);
      console.log(`      Followers: ${followersCount.rows[0].count}\n`);
    }

    // 3. Get all followers data
    console.log('3️⃣ Getting all followers data...');
    const allFollowers = await pool.query(`
      SELECT 
        pf.provider_id,
        pf.follower_id,
        pf.followed_at,
        u.first_name,
        u.last_name,
        u.email
      FROM provider_followers pf
      JOIN users u ON pf.follower_id = u.id
      ORDER BY pf.provider_id, pf.followed_at DESC
    `);
    
    if (allFollowers.rows.length === 0) {
      console.log('   ⚠️ No followers found in database');
    } else {
      console.log(`   Found ${allFollowers.rows.length} follower relationships:\n`);
      allFollowers.rows.forEach(f => {
        console.log(`   Provider ID ${f.provider_id} ← Follower: ${f.first_name} ${f.last_name} (${f.email})`);
        console.log(`      Followed at: ${f.followed_at}\n`);
      });
    }

    // 4. Test the exact query used in the API
    console.log('4️⃣ Testing API query for each provider...');
    for (const provider of providers.rows) {
      const apiQuery = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url, pf.followed_at
        FROM provider_followers pf
        JOIN users u ON pf.follower_id = u.id
        WHERE pf.provider_id = $1
        ORDER BY pf.followed_at DESC
      `, [provider.id]);
      
      console.log(`   Provider ${provider.id} (${provider.business_name || provider.email}):`);
      console.log(`   API would return: ${apiQuery.rows.length} followers`);
      if (apiQuery.rows.length > 0) {
        apiQuery.rows.forEach(f => {
          console.log(`      - ${f.first_name} ${f.last_name}`);
        });
      }
      console.log('');
    }

    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testFollowersIssue();
