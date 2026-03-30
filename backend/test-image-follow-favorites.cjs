require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./models');

async function testIssues() {
  try {
    console.log('🔍 Testing Service Images, Follow & Favorites Issues\n');
    
    // 1. Check if provider_followers table exists
    console.log('1️⃣ Checking provider_followers table...');
    const followersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'provider_followers'
      );
    `);
    console.log('   provider_followers exists:', followersTableCheck.rows[0].exists);
    
    if (followersTableCheck.rows[0].exists) {
      const followersCount = await pool.query('SELECT COUNT(*) FROM provider_followers');
      console.log('   Total followers in DB:', followersCount.rows[0].count);
      
      const sampleFollowers = await pool.query('SELECT * FROM provider_followers LIMIT 5');
      console.log('   Sample followers:', JSON.stringify(sampleFollowers.rows, null, 2));
    }
    
    // 2. Check if favorites table exists
    console.log('\n2️⃣ Checking favorites table...');
    const favoritesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `);
    console.log('   favorites exists:', favoritesTableCheck.rows[0].exists);
    
    if (favoritesTableCheck.rows[0].exists) {
      const favoritesCount = await pool.query('SELECT COUNT(*) FROM favorites');
      console.log('   Total favorites in DB:', favoritesCount.rows[0].count);
      
      const sampleFavorites = await pool.query('SELECT * FROM favorites LIMIT 5');
      console.log('   Sample favorites:', JSON.stringify(sampleFavorites.rows, null, 2));
    }
    
    // 3. Check services table and images column
    console.log('\n3️⃣ Checking services table and images...');
    const servicesCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name IN ('images', 'image_url', 'provider_id')
    `);
    console.log('   Services columns:', JSON.stringify(servicesCheck.rows, null, 2));
    
    // Get sample services with images
    const servicesWithImages = await pool.query(`
      SELECT id, title, provider_id, images, 
             CASE 
               WHEN images IS NULL THEN 'NULL'
               WHEN images = '' THEN 'EMPTY STRING'
               ELSE 'HAS DATA'
             END as image_status
      FROM services 
      LIMIT 10
    `);
    console.log('\n   Sample services:');
    servicesWithImages.rows.forEach(s => {
      console.log(`   - Service ${s.id}: "${s.title}" (Provider: ${s.provider_id})`);
      console.log(`     Image Status: ${s.image_status}`);
      console.log(`     Images Data: ${s.images}`);
    });
    
    // 4. Check service_providers table
    console.log('\n4️⃣ Checking service_providers table...');
    const providersCheck = await pool.query(`
      SELECT id, user_id, business_name 
      FROM service_providers 
      LIMIT 5
    `);
    console.log('   Sample providers:', JSON.stringify(providersCheck.rows, null, 2));
    
    // 5. Test relationship between services and service_providers
    console.log('\n5️⃣ Testing services -> service_providers relationship...');
    const relationshipTest = await pool.query(`
      SELECT s.id as service_id, s.title, s.provider_id, 
             sp.id as sp_id, sp.business_name, sp.user_id,
             s.images
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      LIMIT 5
    `);
    console.log('   Relationship test:', JSON.stringify(relationshipTest.rows, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testIssues();
