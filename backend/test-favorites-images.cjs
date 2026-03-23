const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testFavoritesImages() {
  try {
    console.log('\n🧪 Testing Favorites Images Query...\n');
    
    // Get a test user
    const userResult = await pool.query(`
      SELECT id FROM users WHERE user_type = 'traveler' LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No traveler users found');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log('✅ Test user ID:', userId);
    
    // Get favorites with images
    const favoritesResult = await pool.query(`
      SELECT f.*, 
             -- Service data
             s.id as service_id,
             s.title as service_title,
             s.description as service_description,
             s.category as service_category,
             s.price as service_price,
             s.images as service_images,
             s.location as service_location,
             -- Provider data for the service
             sp2.business_name as service_provider_name
      FROM favorites f
      LEFT JOIN services s ON f.service_id = s.id
      LEFT JOIN service_providers sp2 ON s.provider_id = sp2.id
      WHERE f.user_id = $1 AND f.service_id IS NOT NULL
      ORDER BY f.created_at DESC
    `, [userId]);
    
    console.log(`\n✅ Found ${favoritesResult.rows.length} service favorites\n`);
    
    if (favoritesResult.rows.length > 0) {
      favoritesResult.rows.forEach((fav, index) => {
        console.log(`\n--- Service Favorite ${index + 1} ---`);
        console.log('Title:', fav.service_title);
        console.log('Price:', fav.service_price);
        console.log('Images (raw):', fav.service_images);
        console.log('Images type:', typeof fav.service_images);
        
        // Try to parse images
        try {
          if (fav.service_images) {
            const parsed = JSON.parse(fav.service_images);
            console.log('Images (parsed):', parsed);
            console.log('First image:', parsed[0] || 'No images');
          }
        } catch (e) {
          console.log('❌ Error parsing images:', e.message);
        }
      });
    } else {
      console.log('ℹ️ No service favorites found. Add some services to favorites first.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testFavoritesImages();
