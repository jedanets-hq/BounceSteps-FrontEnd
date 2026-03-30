const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'isafari_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@Jctnftr01',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testProviderProfileIssues() {
  try {
    console.log('🔍 Testing Provider Profile Issues...\n');

    // 1. Check provider_followers table structure
    console.log('1️⃣ Checking provider_followers table...');
    const followersTableCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'provider_followers'
      ORDER BY ordinal_position
    `);
    console.log('provider_followers columns:', followersTableCheck.rows);

    // Check if table exists
    if (followersTableCheck.rows.length === 0) {
      console.log('❌ provider_followers table does NOT exist!');
      console.log('Creating provider_followers table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_followers (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
          follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider_id, follower_id)
        )
      `);
      console.log('✅ provider_followers table created');
    } else {
      console.log('✅ provider_followers table exists');
    }

    // 2. Check favorites table structure
    console.log('\n2️⃣ Checking favorites table...');
    const favoritesTableCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    console.log('favorites columns:', favoritesTableCheck.rows);

    if (favoritesTableCheck.rows.length === 0) {
      console.log('❌ favorites table does NOT exist!');
      console.log('Creating favorites table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, provider_id)
        )
      `);
      console.log('✅ favorites table created');
    } else {
      console.log('✅ favorites table exists');
    }

    // 3. Check services table and images column
    console.log('\n3️⃣ Checking services table images column...');
    const servicesImagesCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'services' AND column_name = 'images'
    `);
    console.log('services.images column:', servicesImagesCheck.rows);

    // 4. Test actual service images data
    console.log('\n4️⃣ Checking actual service images data...');
    const servicesWithImages = await pool.query(`
      SELECT id, title, provider_id, images, 
             CASE 
               WHEN images IS NULL THEN 'NULL'
               WHEN images = '' THEN 'EMPTY STRING'
               ELSE 'HAS DATA'
             END as image_status
      FROM services
      WHERE is_active = true
      LIMIT 10
    `);
    console.log('Sample services with images:');
    servicesWithImages.rows.forEach(s => {
      console.log(`  - Service ${s.id}: ${s.title} | Status: ${s.image_status} | Images: ${s.images}`);
    });

    // 5. Check service_providers table
    console.log('\n5️⃣ Checking service_providers table...');
    const providersCheck = await pool.query(`
      SELECT id, user_id, business_name
      FROM service_providers
      LIMIT 5
    `);
    console.log('Sample providers:');
    providersCheck.rows.forEach(p => {
      console.log(`  - Provider ID: ${p.id} | User ID: ${p.user_id} | Name: ${p.business_name}`);
    });

    // 6. Check relationship between services and service_providers
    console.log('\n6️⃣ Checking services.provider_id references...');
    const servicesProviderCheck = await pool.query(`
      SELECT s.id as service_id, s.title, s.provider_id, sp.id as sp_id, sp.business_name
      FROM services s
      LEFT JOIN service_providers sp ON s.provider_id = sp.id
      WHERE s.is_active = true
      LIMIT 5
    `);
    console.log('Services with provider relationship:');
    servicesProviderCheck.rows.forEach(s => {
      console.log(`  - Service ${s.service_id}: ${s.title} | provider_id: ${s.provider_id} | SP found: ${s.sp_id ? 'YES' : 'NO'} | ${s.business_name || 'N/A'}`);
    });

    // 7. Test a specific provider's data
    console.log('\n7️⃣ Testing specific provider data (ID from URL)...');
    const testProviderId = 1;
    const providerTest = await pool.query(`
      SELECT sp.*, u.email, u.first_name, u.last_name
      FROM service_providers sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1
    `, [testProviderId]);
    
    if (providerTest.rows.length > 0) {
      console.log('Provider found:', providerTest.rows[0]);
      
      // Get services for this provider
      const servicesTest = await pool.query(`
        SELECT id, title, images, category, price
        FROM services
        WHERE provider_id = $1 AND is_active = true
      `, [testProviderId]);
      console.log(`Services for provider ${testProviderId}:`, servicesTest.rows);
    } else {
      console.log('❌ Provider not found');
    }

    console.log('\n✅ Investigation complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testProviderProfileIssues();
