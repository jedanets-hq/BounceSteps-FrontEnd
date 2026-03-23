const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function checkStories() {
  try {
    console.log('🔍 Checking stories in database...\n');
    
    const allStories = await pool.query(`
      SELECT 
        ts.id,
        ts.title,
        ts.status,
        ts.created_at,
        u.first_name,
        u.last_name
      FROM traveler_stories ts
      JOIN users u ON ts.user_id = u.id
      ORDER BY ts.created_at DESC
    `);
    
    console.log(`📊 Total stories: ${allStories.rows.length}\n`);
    
    if (allStories.rows.length > 0) {
      console.log('📖 All stories:');
      allStories.rows.forEach(story => {
        console.log(`  [${story.status}] ${story.title}`);
        console.log(`      by ${story.first_name} ${story.last_name} (ID: ${story.id})`);
      });
    }
    
    // Count by status
    const statusCounts = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM traveler_stories
      GROUP BY status
    `);
    
    console.log('\n📊 By status:');
    statusCounts.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkStories();
