const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://isafari_user:@Jctnftr01@localhost:5432/isafari_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testFollowersSystem() {
  console.log('🧪 Testing Followers System...\n');
  
  try {
    // 1. Check if provider_followers table exists
    console.log('1️⃣ Checking provider_followers table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provider_followers'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ provider_followers table exists\n');
      
      // Get table structure
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'provider_followers'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Table structure:');
      structure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      console.log('');
    } else {
      console.log('❌ provider_followers table does NOT exist');
      console.log('Creating table...\n');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_followers (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider_id, follower_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_provider_followers_provider ON provider_followers(provider_id);
        CREATE INDEX IF NOT EXISTS idx_provider_followers_follower ON provider_followers(follower_id);
      `);
      
      console.log('✅ Table created successfully\n');
    }
    
    // 2. Check current followers
    console.log('2️⃣ Checking current followers...');
    const followersCount = await pool.query('SELECT COUNT(*) FROM provider_followers');
    console.log(`   Total followers: ${followersCount.rows[0].count}\n`);
    
    if (parseInt(followersCount.rows[0].count) > 0) {
      const followers = await pool.query(`
        SELECT 
          pf.id,
          pf.provider_id,
          pf.follower_id,
          pf.followed_at,
          p.first_name || ' ' || p.last_name as provider_name,
          f.first_name || ' ' || f.last_name as follower_name
        FROM provider_followers pf
        LEFT JOIN users p ON pf.provider_id = p.id
        LEFT JOIN users f ON pf.follower_id = f.id
        ORDER BY pf.followed_at DESC
        LIMIT 10
      `);
      
      console.log('📊 Recent followers:');
      followers.rows.forEach(f => {
        console.log(`   - ${f.follower_name} follows ${f.provider_name} (${new Date(f.followed_at).toLocaleDateString()})`);
      });
      console.log('');
    }
    
    // 3. Test analytics endpoint data
    console.log('3️⃣ Checking bookings for analytics...');
    const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings WHERE status != $1', ['cancelled']);
    console.log(`   Total active bookings: ${bookingsCount.rows[0].count}\n`);
    
    if (parseInt(bookingsCount.rows[0].count) > 0) {
      const recentBookings = await pool.query(`
        SELECT 
          b.id,
          b.service_id,
          b.provider_id,
          b.total_amount,
          b.status,
          b.created_at,
          s.title as service_title,
          sp.business_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN service_providers sp ON b.provider_id = sp.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `);
      
      console.log('📊 Recent bookings:');
      recentBookings.rows.forEach(b => {
        console.log(`   - ${b.service_title} by ${b.business_name || 'Unknown'} - TZS ${b.total_amount} (${b.status})`);
      });
      console.log('');
    }
    
    console.log('✅ Followers system test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testFollowersSystem();
