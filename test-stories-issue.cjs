const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testStoriesIssue() {
  try {
    console.log('🔍 Testing Traveler Stories Issue...\n');

    // 1. Check if traveler_stories table exists
    console.log('1️⃣ Checking if traveler_stories table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'traveler_stories'
      );
    `);
    console.log('Table exists:', tableCheck.rows[0].exists);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table traveler_stories does NOT exist!');
      console.log('\n📋 Creating traveler_stories table...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS traveler_stories (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      
      console.log('✅ Table created successfully!');
    }

    // 2. Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'traveler_stories'
      ORDER BY ordinal_position;
    `);
    console.log('Columns:', columns.rows);

    // 3. Count stories by status
    console.log('\n3️⃣ Counting stories by status...');
    const counts = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM traveler_stories
      GROUP BY status
      ORDER BY status;
    `);
    console.log('Stories by status:', counts.rows);

    // 4. Get all stories with user info
    console.log('\n4️⃣ Getting all stories with user info...');
    const allStories = await pool.query(`
      SELECT 
        ts.id,
        ts.title,
        ts.status,
        ts.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.user_type
      FROM traveler_stories ts
      LEFT JOIN users u ON ts.user_id = u.id
      ORDER BY ts.created_at DESC;
    `);
    console.log(`Total stories: ${allStories.rows.length}`);
    allStories.rows.forEach(story => {
      console.log(`  - ID: ${story.id}, Title: "${story.title}", Status: ${story.status}, User: ${story.first_name} ${story.last_name} (${story.email})`);
    });

    // 5. Check if there are any admin users
    console.log('\n5️⃣ Checking admin users...');
    const admins = await pool.query(`
      SELECT id, email, first_name, last_name, user_type
      FROM users
      WHERE user_type = 'admin';
    `);
    console.log(`Admin users found: ${admins.rows.length}`);
    admins.rows.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.first_name} ${admin.last_name})`);
    });

    // 6. Test the exact query used in the admin endpoint
    console.log('\n6️⃣ Testing admin endpoint query (all stories)...');
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
        u.avatar_url as profile_image
      FROM traveler_stories ts
      JOIN users u ON ts.user_id = u.id
      ORDER BY ts.created_at DESC
    `);
    console.log(`Query returned ${adminQuery.rows.length} stories`);

    // 7. Test with status filter
    console.log('\n7️⃣ Testing with status filter (pending)...');
    const pendingQuery = await pool.query(`
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
        u.avatar_url as profile_image
      FROM traveler_stories ts
      JOIN users u ON ts.user_id = u.id
      WHERE ts.status = $1
      ORDER BY ts.created_at DESC
    `, ['pending']);
    console.log(`Pending stories: ${pendingQuery.rows.length}`);

    // 8. If no stories exist, create test data
    if (allStories.rows.length === 0) {
      console.log('\n8️⃣ No stories found. Creating test stories...');
      
      // Get a traveler user
      const traveler = await pool.query(`
        SELECT id FROM users WHERE user_type = 'traveler' LIMIT 1
      `);
      
      if (traveler.rows.length > 0) {
        const userId = traveler.rows[0].id;
        
        await pool.query(`
          INSERT INTO traveler_stories (user_id, title, content, location, trip_date, status)
          VALUES 
            ($1, 'Amazing Safari Experience', 'Had an incredible time exploring the Serengeti. The wildlife was breathtaking!', 'Serengeti National Park', '2024-01-15', 'pending'),
            ($1, 'Zanzibar Beach Paradise', 'The beaches in Zanzibar are absolutely stunning. Crystal clear water and white sand.', 'Zanzibar', '2024-02-20', 'approved'),
            ($1, 'Kilimanjaro Trek', 'Climbing Mount Kilimanjaro was challenging but so rewarding. The views were spectacular!', 'Mount Kilimanjaro', '2024-03-10', 'pending')
        `, [userId]);
        
        console.log('✅ Test stories created!');
      } else {
        console.log('⚠️ No traveler users found to create test stories');
      }
    }

    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testStoriesIssue();
