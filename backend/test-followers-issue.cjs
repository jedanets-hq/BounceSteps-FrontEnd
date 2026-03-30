const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function testFollowers() {
  try {
    console.log('🔍 Testing followers functionality...\n');
    
    // 1. Check if provider_followers table exists
    console.log('1️⃣ Checking if provider_followers table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provider_followers'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('\n❌ Table does not exist! Creating it now...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_followers (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider_id, follower_id)
        );
      `);
      console.log('✅ Table created successfully!');
    }
    
    // 2. Get all service providers
    console.log('\n2️⃣ Getting all service providers...');
    const providers = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.user_type
      FROM users u
      WHERE u.user_type = 'service_provider'
      ORDER BY u.id
      LIMIT 5
    `);
    console.log(`Found ${providers.rows.length} service providers:`);
    providers.rows.forEach(p => {
      console.log(`  - ID: ${p.id}, Name: ${p.first_name} ${p.last_name}, Email: ${p.email}`);
    });
    
    // 3. Check followers for each provider
    console.log('\n3️⃣ Checking followers for each provider...');
    for (const provider of providers.rows) {
      const followers = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, pf.followed_at
        FROM provider_followers pf
        JOIN users u ON pf.follower_id = u.id
        WHERE pf.provider_id = $1
        ORDER BY pf.followed_at DESC
      `, [provider.id]);
      
      console.log(`\n  Provider: ${provider.first_name} ${provider.last_name} (ID: ${provider.id})`);
      console.log(`  Followers count: ${followers.rows.length}`);
      
      if (followers.rows.length > 0) {
        followers.rows.forEach(f => {
          console.log(`    - ${f.first_name} ${f.last_name} (${f.email}) - Followed: ${f.followed_at}`);
        });
      } else {
        console.log(`    No followers yet`);
      }
    }
    
    // 4. Get total followers count
    console.log('\n4️⃣ Total followers in system...');
    const totalFollowers = await pool.query(`
      SELECT COUNT(*) as total FROM provider_followers
    `);
    console.log(`Total follower relationships: ${totalFollowers.rows[0].total}`);
    
    // 5. Check if there are any travelers who could follow
    console.log('\n5️⃣ Checking travelers in system...');
    const travelers = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE user_type = 'traveler'
    `);
    console.log(`Total travelers: ${travelers.rows[0].total}`);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testFollowers();
