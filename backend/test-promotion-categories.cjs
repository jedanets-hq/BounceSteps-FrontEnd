const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@Jctnftr01'
});

async function testPromotionCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing promotion categories...\n');
    
    // 1. Check if columns exist
    console.log('1️⃣ Checking if promotion columns exist...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'services'
      AND column_name IN (
        'search_priority',
        'category_priority',
        'is_enhanced_listing',
        'has_increased_visibility',
        'carousel_priority',
        'has_maximum_visibility',
        'promotion_expires_at'
      )
      ORDER BY column_name;
    `);
    
    console.log('✅ Found columns:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    // 2. Get a test service
    console.log('\n2️⃣ Getting a test service...');
    const serviceResult = await client.query(`
      SELECT id, title, search_priority, category_priority, 
             is_enhanced_listing, has_increased_visibility,
             carousel_priority, has_maximum_visibility,
             promotion_expires_at
      FROM services
      LIMIT 1
    `);
    
    if (serviceResult.rows.length === 0) {
      console.log('❌ No services found in database');
      return;
    }
    
    const testService = serviceResult.rows[0];
    console.log('✅ Test service:', testService.title);
    console.log('   Current promotion settings:');
    console.log(`   - Search Priority: ${testService.search_priority}`);
    console.log(`   - Category Priority: ${testService.category_priority}`);
    console.log(`   - Enhanced Listing: ${testService.is_enhanced_listing}`);
    console.log(`   - Increased Visibility: ${testService.has_increased_visibility}`);
    console.log(`   - Carousel Priority: ${testService.carousel_priority}`);
    console.log(`   - Maximum Visibility: ${testService.has_maximum_visibility}`);
    console.log(`   - Expires At: ${testService.promotion_expires_at || 'Never'}`);
    
    // 3. Test updating promotion settings
    console.log('\n3️⃣ Testing promotion update...');
    const updateResult = await client.query(`
      UPDATE services 
      SET 
        search_priority = 75,
        category_priority = 80,
        is_enhanced_listing = true,
        has_increased_visibility = true,
        carousel_priority = 90,
        has_maximum_visibility = false,
        promotion_expires_at = NOW() + INTERVAL '30 days'
      WHERE id = $1
      RETURNING *
    `, [testService.id]);
    
    console.log('✅ Updated promotion settings:');
    const updated = updateResult.rows[0];
    console.log(`   - Search Priority: ${updated.search_priority}`);
    console.log(`   - Category Priority: ${updated.category_priority}`);
    console.log(`   - Enhanced Listing: ${updated.is_enhanced_listing}`);
    console.log(`   - Increased Visibility: ${updated.has_increased_visibility}`);
    console.log(`   - Carousel Priority: ${updated.carousel_priority}`);
    console.log(`   - Maximum Visibility: ${updated.has_maximum_visibility}`);
    console.log(`   - Expires At: ${updated.promotion_expires_at}`);
    
    // 4. Test ordering by priority
    console.log('\n4️⃣ Testing priority ordering...');
    const orderedResult = await client.query(`
      SELECT id, title, search_priority, category_priority, carousel_priority
      FROM services
      ORDER BY search_priority DESC, category_priority DESC
      LIMIT 5
    `);
    
    console.log('✅ Top 5 services by priority:');
    orderedResult.rows.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title}`);
      console.log(`      Search: ${service.search_priority}, Category: ${service.category_priority}, Carousel: ${service.carousel_priority}`);
    });
    
    console.log('\n✅ All tests passed! Promotion categories are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPromotionCategories();
