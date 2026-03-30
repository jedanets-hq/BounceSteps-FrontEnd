const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testFavorites() {
  try {
    console.log('🔍 Testing Favorites Functionality\n');
    
    // 1. Check if favorites table exists
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'favorites'
    `);
    console.log('✅ Favorites table exists:', tableCheck.rows.length > 0);
    
    // 2. Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    console.log('\n📋 Table Structure:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Check constraints
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'favorites'
    `);
    console.log('\n🔒 Constraints:');
    constraints.rows.forEach(c => {
      console.log(`   ${c.constraint_name}: ${c.constraint_type}`);
    });
    
    // 4. Check if there are any favorites
    const count = await pool.query('SELECT COUNT(*) as count FROM favorites');
    console.log('\n📊 Total favorites in DB:', count.rows[0].count);
    
    // 5. Sample favorites data
    const sample = await pool.query('SELECT * FROM favorites LIMIT 5');
    console.log('\n📝 Sample favorites:');
    if (sample.rows.length > 0) {
      console.log(JSON.stringify(sample.rows, null, 2));
    } else {
      console.log('   No favorites found');
    }
    
    // 6. Check users table for test user
    const testUser = await pool.query(`
      SELECT id, email, first_name, last_name, user_type 
      FROM users 
      WHERE email = 'joctee@gmail.com'
    `);
    console.log('\n👤 Test User (joctee@gmail.com):');
    if (testUser.rows.length > 0) {
      console.log(JSON.stringify(testUser.rows[0], null, 2));
      
      // Check favorites for this user
      const userFavorites = await pool.query(`
        SELECT f.*, sp.business_name 
        FROM favorites f
        LEFT JOIN service_providers sp ON f.provider_id = sp.user_id
        WHERE f.user_id = $1
      `, [testUser.rows[0].id]);
      console.log(`\n⭐ Favorites for user ${testUser.rows[0].id}:`, userFavorites.rows.length);
      if (userFavorites.rows.length > 0) {
        console.log(JSON.stringify(userFavorites.rows, null, 2));
      }
    } else {
      console.log('   User not found');
    }
    
    // 7. Check service_providers table
    const providers = await pool.query('SELECT user_id, business_name FROM service_providers LIMIT 5');
    console.log('\n🏢 Sample Providers:');
    if (providers.rows.length > 0) {
      console.log(JSON.stringify(providers.rows, null, 2));
    } else {
      console.log('   No providers found');
    }
    
    console.log('\n✅ Favorites debug complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testFavorites();
