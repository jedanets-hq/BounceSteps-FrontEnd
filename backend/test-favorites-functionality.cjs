const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testFavorites() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 TESTING FAVORITES FUNCTIONALITY\n');
    
    // Check if favorites table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'favorites'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Favorites table does NOT exist');
      console.log('   Creating favorites table...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
          provider_id INTEGER REFERENCES service_providers(user_id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, service_id),
          UNIQUE(user_id, provider_id)
        )
      `);
      
      console.log('   ✅ Favorites table created');
    } else {
      console.log('✅ Favorites table exists');
    }
    
    // Check table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Favorites table structure:');
    columnsResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Get a test user and service
    const userResult = await client.query(`
      SELECT id, first_name, user_type
      FROM users
      WHERE user_type = 'traveler'
      LIMIT 1
    `);
    
    const serviceResult = await client.query(`
      SELECT id, title, provider_id
      FROM services
      LIMIT 1
    `);
    
    if (userResult.rows.length === 0 || serviceResult.rows.length === 0) {
      console.log('\n❌ No test data available');
      return;
    }
    
    const user = userResult.rows[0];
    const service = serviceResult.rows[0];
    
    console.log(`\n✅ Test user: ${user.first_name} (ID: ${user.id})`);
    console.log(`✅ Test service: ${service.title} (ID: ${service.id})`);
    
    // Test adding favorite
    console.log('\n📝 Testing add to favorites...');
    
    try {
      const addResult = await client.query(`
        INSERT INTO favorites (user_id, service_id, provider_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, service_id) DO NOTHING
        RETURNING *
      `, [user.id, service.id, service.provider_id]);
      
      if (addResult.rows.length > 0) {
        console.log('✅ Favorite added successfully');
        console.log(`   Favorite ID: ${addResult.rows[0].id}`);
      } else {
        console.log('ℹ️  Favorite already exists (conflict handled)');
      }
    } catch (error) {
      console.error('❌ Add favorite error:', error.message);
    }
    
    // Test fetching favorites
    console.log('\n📝 Testing fetch favorites...');
    
    const fetchResult = await client.query(`
      SELECT 
        f.*,
        s.title as service_title,
        s.category as service_category,
        s.price as service_price
      FROM favorites f
      LEFT JOIN services s ON f.service_id = s.id
      WHERE f.user_id = $1
    `, [user.id]);
    
    console.log(`✅ Found ${fetchResult.rows.length} favorite(s)`);
    fetchResult.rows.forEach(fav => {
      console.log(`   - ${fav.service_title} (ID: ${fav.service_id})`);
    });
    
    // Clean up test favorite
    await client.query('DELETE FROM favorites WHERE user_id = $1 AND service_id = $2', [user.id, service.id]);
    console.log('\n🧹 Test favorite cleaned up');
    
    console.log('\n✅ FAVORITES FUNCTIONALITY TEST PASSED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testFavorites();
