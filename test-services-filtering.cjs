const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testServicesFiltering() {
  try {
    console.log('🔍 Testing services filtering...\n');
    
    // Test 1: Get all active services
    console.log('📦 Test 1: All active services');
    const allServices = await pool.query(`
      SELECT s.id, s.title, s.category, s.region, s.district, s.area, sp.business_name
      FROM services s
      INNER JOIN service_providers sp ON s.provider_id = sp.user_id
      WHERE s.status = 'active' AND s.is_active = true
      LIMIT 10
    `);
    console.log(`   Found ${allServices.rows.length} services`);
    allServices.rows.forEach(s => {
      console.log(`   - ${s.title} (${s.category}) by ${s.business_name}`);
      console.log(`     Location: ${s.area || 'N/A'}, ${s.district || 'N/A'}, ${s.region || 'N/A'}`);
    });
    
    // Test 2: Get unique locations
    console.log('\n📍 Test 2: Unique locations with services');
    const locations = await pool.query(`
      SELECT DISTINCT region, district, area
      FROM services
      WHERE status = 'active' AND is_active = true
      ORDER BY region, district, area
    `);
    console.log(`   Found ${locations.rows.length} unique locations:`);
    locations.rows.forEach(loc => {
      console.log(`   - ${loc.area || 'N/A'}, ${loc.district || 'N/A'}, ${loc.region || 'N/A'}`);
    });
    
    // Test 3: Get unique categories
    console.log('\n🏷️ Test 3: Unique categories');
    const categories = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM services
      WHERE status = 'active' AND is_active = true
      GROUP BY category
      ORDER BY count DESC
    `);
    console.log(`   Found ${categories.rows.length} categories:`);
    categories.rows.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat.count} services`);
    });
    
    console.log('\n✅ Tests complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testServicesFiltering();
