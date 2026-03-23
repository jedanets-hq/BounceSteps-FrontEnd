const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db'
});

async function checkServices() {
  try {
    console.log('🔍 Checking services in database...\n');
    
    // Get all services
    const allServices = await pool.query('SELECT id, title, is_featured, is_trending, status FROM services ORDER BY created_at DESC');
    console.log(`📊 Total services: ${allServices.rows.length}\n`);
    
    // Count by status
    const featured = allServices.rows.filter(s => s.is_featured);
    const trending = allServices.rows.filter(s => s.is_trending);
    const active = allServices.rows.filter(s => s.status === 'active');
    
    console.log(`⭐ Featured services: ${featured.length}`);
    console.log(`📈 Trending services: ${trending.length}`);
    console.log(`✅ Active services: ${active.length}\n`);
    
    // Show first 10 services
    console.log('📋 First 10 services:');
    allServices.rows.slice(0, 10).forEach(s => {
      console.log(`  - ID: ${s.id}, Title: ${s.title}`);
      console.log(`    Featured: ${s.is_featured}, Trending: ${s.is_trending}, Status: ${s.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkServices();
