const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://isafari_db_user:@Jctnftr01@dpg-cu0rvf08fa8c73a5rvog-a.oregon-postgres.render.com/isafari_db',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testFeaturedTrending() {
  try {
    console.log('🔍 Checking featured and trending services...\n');
    
    // Check featured services
    const featuredResult = await pool.query(`
      SELECT id, title, is_featured, is_trending, status, is_active
      FROM services
      WHERE is_featured = true
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`✅ Featured Services: ${featuredResult.rows.length}`);
    featuredResult.rows.forEach(s => {
      console.log(`  - ${s.title} (ID: ${s.id}, Status: ${s.status}, Active: ${s.is_active})`);
    });
    
    console.log('\n');
    
    // Check trending services
    const trendingResult = await pool.query(`
      SELECT id, title, is_featured, is_trending, status, is_active
      FROM services
      WHERE is_trending = true
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`✅ Trending Services: ${trendingResult.rows.length}`);
    trendingResult.rows.forEach(s => {
      console.log(`  - ${s.title} (ID: ${s.id}, Status: ${s.status}, Active: ${s.is_active})`);
    });
    
    console.log('\n');
    
    // Check total active services
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM services
      WHERE status = 'active' AND is_active = true
    `);
    
    console.log(`📊 Total Active Services: ${totalResult.rows[0].total}`);
    
    // If no featured/trending, suggest some services to mark
    if (featuredResult.rows.length === 0 || trendingResult.rows.length === 0) {
      console.log('\n⚠️  No featured or trending services found. Here are some active services you can mark:');
      
      const suggestResult = await pool.query(`
        SELECT id, title, category, status, is_active
        FROM services
        WHERE status = 'active' AND is_active = true
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      suggestResult.rows.forEach(s => {
        console.log(`  - ${s.title} (ID: ${s.id}, Category: ${s.category})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testFeaturedTrending();
