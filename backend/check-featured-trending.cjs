const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkFeaturedTrending() {
  try {
    console.log('🔍 Checking featured and trending services...\n');
    
    // Check if columns exist
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'services' 
      AND column_name IN ('is_featured', 'is_trending')
      ORDER BY column_name
    `);
    
    console.log('📋 Columns in services table:');
    columnsCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}, default: ${col.column_default}`);
    });
    console.log('');
    
    // Get services with featured/trending status
    const services = await pool.query(`
      SELECT id, title, is_featured, is_trending, status, is_active
      FROM services
      ORDER BY id
    `);
    
    console.log(`📊 Total services: ${services.rows.length}\n`);
    
    const featured = services.rows.filter(s => s.is_featured === true);
    const trending = services.rows.filter(s => s.is_trending === true);
    
    console.log(`⭐ Featured services: ${featured.length}`);
    if (featured.length > 0) {
      featured.forEach(s => console.log(`   - ${s.id}: ${s.title}`));
    }
    console.log('');
    
    console.log(`📈 Trending services: ${trending.length}`);
    if (trending.length > 0) {
      trending.forEach(s => console.log(`   - ${s.id}: ${s.title}`));
    }
    console.log('');
    
    // Show all services with their status
    console.log('📋 All services:');
    services.rows.forEach(s => {
      console.log(`  ID ${s.id}: ${s.title}`);
      console.log(`    Featured: ${s.is_featured}, Trending: ${s.is_trending}, Status: ${s.status}, Active: ${s.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkFeaturedTrending();
