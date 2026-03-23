const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testFixedQuery() {
  try {
    console.log('🔍 Testing FIXED admin portal query...\n');
    
    // Test the fixed query
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
    
    console.log(`✅ Query successful! Found ${adminQuery.rows.length} stories\n`);
    
    if (adminQuery.rows.length > 0) {
      console.log('Stories found:');
      adminQuery.rows.forEach((story, index) => {
        console.log(`\n${index + 1}. ${story.title}`);
        console.log(`   Status: ${story.status}`);
        console.log(`   User: ${story.first_name} ${story.last_name}`);
        console.log(`   Created: ${story.created_at}`);
      });
    } else {
      console.log('⚠️  No stories found in database');
    }
    
    // Test with status filter
    console.log('\n\n🔍 Testing with status filter (pending)...\n');
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
    
    console.log(`✅ Found ${pendingQuery.rows.length} pending stories\n`);
    
    console.log('✅ All queries working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testFixedQuery();
