const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testAdminStories() {
  try {
    console.log('🔍 Testing Admin Stories Access...\n');
    
    // 1. Check if traveler_stories table exists
    console.log('1️⃣ Checking if traveler_stories table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'traveler_stories'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table does not exist! Creating it...\n');
      await pool.query(`
        CREATE TABLE traveler_stories (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          location VARCHAR(255),
          trip_date DATE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Table created!\n');
    }
    
    // 2. Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'traveler_stories'
      ORDER BY ordinal_position;
    `);
    console.log('Columns:', columns.rows);
    
    // 3. Count total stories
    console.log('\n3️⃣ Counting stories by status...');
    const counts = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM traveler_stories
      GROUP BY status
      ORDER BY status;
    `);
    console.log('Stories by status:', counts.rows);
    
    // 4. Get all stories with user info
    console.log('\n4️⃣ Fetching all stories with user info...');
    const allStories = await pool.query(`
      SELECT 
        ts.id,
        ts.title,
        ts.status,
        ts.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.user_type
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      ORDER BY ts.created_at DESC
      LIMIT 10;
    `);
    console.log(`\nFound ${allStories.rows.length} stories:`);
    allStories.rows.forEach(story => {
      console.log(`  - ID: ${story.id}, Title: "${story.title}", Status: ${story.status}, User: ${story.first_name} ${story.last_name} (${story.user_type})`);
    });
    
    // 5. Check if there are any approved stories
    console.log('\n5️⃣ Checking approved stories...');
    const approvedStories = await pool.query(`
      SELECT COUNT(*) as count
      FROM traveler_stories
      WHERE status = 'approved';
    `);
    console.log('Approved stories count:', approvedStories.rows[0].count);
    
    // 6. Check if there are any pending stories
    console.log('\n6️⃣ Checking pending stories...');
    const pendingStories = await pool.query(`
      SELECT COUNT(*) as count
      FROM traveler_stories
      WHERE status = 'pending';
    `);
    console.log('Pending stories count:', pendingStories.rows[0].count);
    
    // 7. Test the exact query used by admin portal
    console.log('\n7️⃣ Testing admin portal query (all stories)...');
    const adminQuery = await pool.query(`
      SELECT 
        ts.id,
        ts.title,
        ts.content,
        ts.location,
        ts.trip_date,
        ts.status,
        ts.likes_count,
        ts.created_at,
        ts.updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.profile_image
      FROM traveler_stories ts
      JOIN users u ON ts.user_id = u.id
      ORDER BY ts.created_at DESC
    `);
    console.log(`Admin query returned ${adminQuery.rows.length} stories`);
    
    if (adminQuery.rows.length > 0) {
      console.log('\nFirst story details:');
      console.log(JSON.stringify(adminQuery.rows[0], null, 2));
    }
    
    // 8. Check if there are orphaned stories (user_id doesn't exist)
    console.log('\n8️⃣ Checking for orphaned stories...');
    const orphanedStories = await pool.query(`
      SELECT ts.id, ts.title, ts.user_id
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      WHERE u.id IS NULL;
    `);
    if (orphanedStories.rows.length > 0) {
      console.log('⚠️  Found orphaned stories (user deleted):', orphanedStories.rows);
    } else {
      console.log('✅ No orphaned stories found');
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testAdminStories();
