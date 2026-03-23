const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'isafari_db',
  password: '@Jctnftr01',
  port: 5432,
});

async function createProviderFollowersTable() {
  try {
    console.log('🔧 Creating provider_followers table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_followers (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider_id, follower_id)
      );
    `);
    
    console.log('✅ Table created successfully');
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_provider_followers_provider ON provider_followers(provider_id);
      CREATE INDEX IF NOT EXISTS idx_provider_followers_follower ON provider_followers(follower_id);
    `);
    
    console.log('✅ Indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createProviderFollowersTable();
