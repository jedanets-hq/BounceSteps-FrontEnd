const { pool } = require('./config/postgresql');

async function testStoriesSetup() {
  try {
    console.log('🔍 Checking traveler_stories table...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'traveler_stories'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table traveler_stories does NOT exist');
      console.log('Creating table...\n');
      
      await pool.query(`
        CREATE TABLE traveler_stories (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          images TEXT[],
          location VARCHAR(255),
          trip_date DATE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          is_featured BOOLEAN DEFAULT FALSE,
          likes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Table created successfully\n');
    } else {
      console.log('✅ Table traveler_stories exists\n');
    }
    
    // Check columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'traveler_stories'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if status column exists
    const hasStatus = columnsResult.rows.some(col => col.column_name === 'status');
    
    if (!hasStatus) {
      console.log('\n⚠️  Status column missing. Adding it...');
      await pool.query(`
        ALTER TABLE traveler_stories 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
      `);
      console.log('✅ Status column added\n');
    } else {
      console.log('\n✅ Status column exists\n');
    }
    
    // Check existing stories
    const storiesCount = await pool.query('SELECT COUNT(*) FROM traveler_stories');
    console.log(`📊 Total stories in database: ${storiesCount.rows[0].count}\n`);
    
    // Show sample stories if any
    const sampleStories = await pool.query(`
      SELECT id, title, status, created_at 
      FROM traveler_stories 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (sampleStories.rows.length > 0) {
      console.log('📖 Recent stories:');
      sampleStories.rows.forEach(story => {
        console.log(`  - [${story.status}] ${story.title} (ID: ${story.id})`);
      });
    } else {
      console.log('📖 No stories yet');
    }
    
    console.log('\n✅ Setup check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testStoriesSetup();
