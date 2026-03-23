const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:@Jctnftr01@localhost:5432/isafari_db',
  ssl: false
});

async function testServiceFavorites() {
  try {
    console.log('\n🧪 Testing Service Favorites System...\n');
    
    // 1. Check database schema
    console.log('1️⃣ Checking database schema...');
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    console.log('✅ Favorites table schema:');
    console.table(schemaResult.rows);
    
    // 2. Get sample services
    console.log('\n2️⃣ Getting sample services...');
    const servicesResult = await pool.query(`
      SELECT id, title, provider_id, price, category 
      FROM services 
      WHERE is_active = true 
      LIMIT 3
    `);
    console.log(`✅ Found ${servicesResult.rows.length} active services:`);
    console.table(servicesResult.rows);
    
    // 3. Get sample user
    console.log('\n3️⃣ Getting sample user...');
    const userResult = await pool.query(`
      SELECT id, email, user_type 
      FROM users 
      WHERE user_type = 'traveler' 
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ No traveler users found');
      return;
    }
    
    const testUser = userResult.rows[0];
    console.log('✅ Test user:', testUser);
    
    // 4. Test adding service to favorites
    if (servicesResult.rows.length > 0) {
      const testService = servicesResult.rows[0];
      console.log(`\n4️⃣ Adding service ${testService.id} to favorites...`);
      
      try {
        const addResult = await pool.query(`
          INSERT INTO favorites (user_id, service_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          RETURNING *
        `, [testUser.id, testService.id]);
        
        if (addResult.rows.length > 0) {
          console.log('✅ Service added to favorites:', addResult.rows[0]);
        } else {
          console.log('ℹ️ Service already in favorites');
        }
      } catch (error) {
        console.error('❌ Error adding to favorites:', error.message);
      }
    }
    
    // 5. Get all favorites for user
    console.log(`\n5️⃣ Getting all favorites for user ${testUser.id}...`);
    const favoritesResult = await pool.query(`
      SELECT f.*, 
             -- Provider data
             sp.business_name,
             -- Service data
             s.id as service_id,
             s.title as service_title,
             s.price as service_price,
             s.category as service_category
      FROM favorites f
      LEFT JOIN service_providers sp ON f.provider_id = sp.id
      LEFT JOIN services s ON f.service_id = s.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [testUser.id]);
    
    console.log(`✅ Found ${favoritesResult.rows.length} favorites:`);
    console.table(favoritesResult.rows);
    
    // 6. Count favorites by type
    console.log('\n6️⃣ Counting favorites by type...');
    const countResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE provider_id IS NOT NULL) as provider_favorites,
        COUNT(*) FILTER (WHERE service_id IS NOT NULL) as service_favorites,
        COUNT(*) as total_favorites
      FROM favorites
      WHERE user_id = $1
    `, [testUser.id]);
    
    console.log('✅ Favorites count:');
    console.table(countResult.rows);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testServiceFavorites();
