const { Pool } = require('pg');

// Production database connection
const pool = new Pool({
  connectionString: 'postgresql://isafari_db_user:Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0@dpg-ct5bnhij1k6c73a5rvog-a.oregon-postgres.render.com/isafari_db',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUsers() {
  console.log('🔍 CHECKING PRODUCTION DATABASE USERS\n');
  console.log('='.repeat(60));
  
  try {
    // Get all users
    console.log('\n📋 Fetching all users...');
    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, user_type, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`\n✅ Found ${usersResult.rows.length} users:\n`);
    usersResult.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
    // Get travelers specifically
    console.log('\n👤 Travelers:');
    const travelersResult = await pool.query(`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE user_type = 'traveler'
      LIMIT 5
    `);
    
    travelersResult.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    // Check cart items for each traveler
    console.log('\n📦 Checking cart items for travelers...');
    for (const user of travelersResult.rows) {
      const cartResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM cart_items
        WHERE user_id = $1
      `, [user.id]);
      
      console.log(`   ${user.email}: ${cartResult.rows[0].count} cart items`);
    }
    
    // Check bookings for each traveler
    console.log('\n📅 Checking bookings for travelers...');
    for (const user of travelersResult.rows) {
      const bookingsResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM bookings
        WHERE traveler_id = $1
      `, [user.id]);
      
      console.log(`   ${user.email}: ${bookingsResult.rows[0].count} bookings`);
    }
    
    // Check favorites for each traveler
    console.log('\n❤️  Checking favorites for travelers...');
    for (const user of travelersResult.rows) {
      const favoritesResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM favorites
        WHERE user_id = $1
      `, [user.id]);
      
      console.log(`   ${user.email}: ${favoritesResult.rows[0].count} favorites`);
    }
    
    // Check trip plans for each traveler
    console.log('\n🗺️  Checking trip plans for travelers...');
    for (const user of travelersResult.rows) {
      const plansResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM trip_plans
        WHERE user_id = $1
      `, [user.id]);
      
      console.log(`   ${user.email}: ${plansResult.rows[0].count} trip plans`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkUsers();
