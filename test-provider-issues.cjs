const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function testProviderIssues() {
  try {
    console.log('🔍 Testing Provider Issues...\n');

    // 1. Check if provider_followers table exists
    console.log('1️⃣ Checking provider_followers table...');
    const followersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'provider_followers'
      );
    `);
    console.log('   provider_followers exists:', followersTableCheck.rows[0].exists);

    if (followersTableCheck.rows[0].exists) {
      const followersCount = await pool.query('SELECT COUNT(*) FROM provider_followers');
      console.log('   Total followers:', followersCount.rows[0].count);
      
      const sampleFollowers = await pool.query('SELECT * FROM provider_followers LIMIT 3');
      console.log('   Sample data:', sampleFollowers.rows);
    } else {
      console.log('   ❌ Table does not exist! Creating...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_followers (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL,
          follower_id INTEGER NOT NULL,
          followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider_id, follower_id)
        );
      `);
      console.log('   ✅ Table created');
    }

    // 2. Check if favorites table exists
    console.log('\n2️⃣ Checking favorites table...');
    const favoritesTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'favorites'
      );
    `);
    console.log('   favorites exists:', favoritesTableCheck.rows[0].exists);

    if (favoritesTableCheck.rows[0].exists) {
      const favoritesCount = await pool.query('SELECT COUNT(*) FROM favorites');
      console.log('   Total favorites:', favoritesCount.rows[0].count);
      
      const sampleFavorites = await pool.query('SELECT * FROM favorites LIMIT 3');
      console.log('   Sample data:', sampleFavorites.rows);
    } else {
      console.log('   ❌ Table does not exist! Creating...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, provider_id)
        );
      `);
      console.log('   ✅ Table created');
    }

    // 3. Check services table for images
    console.log('\n3️⃣ Checking services images...');
    const servicesWithImages = await pool.query(`
      SELECT id, title, images
      FROM services 
      WHERE is_active = true
      LIMIT 5
    `);
    console.log('   Sample services with images:');
    servicesWithImages.rows.forEach(s => {
      console.log(`   - ${s.title}:`, typeof s.images, s.images);
    });

    // 4. Check if images column is JSONB
    console.log('\n4️⃣ Checking images column type...');
    const columnType = await pool.query(`
      SELECT data_type, column_name
      FROM information_schema.columns
      WHERE table_name = 'services' AND column_name = 'images'
    `);
    console.log('   images column type:', columnType.rows[0]);

    // 5. Get a test provider
    console.log('\n5️⃣ Getting test provider...');
    const testProvider = await pool.query(`
      SELECT sp.id, sp.business_name, sp.user_id, u.email
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      LIMIT 1
    `);
    if (testProvider.rows.length > 0) {
      console.log('   Test provider:', testProvider.rows[0]);
      
      // Check services for this provider
      const providerServices = await pool.query(`
        SELECT id, title, images
        FROM services
        WHERE provider_id = $1 AND is_active = true
        LIMIT 3
      `, [testProvider.rows[0].id]);
      console.log('   Provider services:', providerServices.rows);
    }

    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderIssues();
