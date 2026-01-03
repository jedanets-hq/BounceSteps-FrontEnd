const { Pool } = require('./backend/node_modules/pg');

// PRODUCTION database connection
const productionPool = new Pool({
  connectionString: 'postgresql://isafari_db_user:Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0Tz0@dpg-ct5bnhij1k6c73a5rvog-a.oregon-postgres.render.com/isafari_db',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkProductionDatabase() {
  console.log('🔍 CHECKING PRODUCTION DATABASE (RENDER)\n');
  console.log('='.repeat(60));
  
  try {
    console.log('\n✅ Connecting to production database...');
    await productionPool.query('SELECT 1');
    console.log('✅ Connected successfully!');
    
    // Check cart_items
    console.log('\n📦 CART_ITEMS:');
    const cartResult = await productionPool.query('SELECT COUNT(*) as count FROM cart_items');
    console.log(`   Total: ${cartResult.rows[0].count} records`);
    
    if (parseInt(cartResult.rows[0].count) > 0) {
      const cartSample = await productionPool.query(`
        SELECT ci.id, ci.user_id, ci.service_id, ci.quantity, u.email, s.title
        FROM cart_items ci
        LEFT JOIN users u ON ci.user_id = u.id
        LEFT JOIN services s ON ci.service_id = s.id
        LIMIT 5
      `);
      console.log('   Sample:');
      cartSample.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. ${row.email} - ${row.title} (qty: ${row.quantity})`);
      });
    }
    
    // Check favorites
    console.log('\n❤️  FAVORITES:');
    const favResult = await productionPool.query('SELECT COUNT(*) as count FROM favorites');
    console.log(`   Total: ${favResult.rows[0].count} records`);
    
    if (parseInt(favResult.rows[0].count) > 0) {
      const favSample = await productionPool.query(`
        SELECT f.id, f.user_id, f.provider_id, u.email, sp.business_name
        FROM favorites f
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN service_providers sp ON f.provider_id = sp.id
        LIMIT 5
      `);
      console.log('   Sample:');
      favSample.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. ${row.email} - ${row.business_name}`);
      });
    }
    
    // Check trip_plans
    console.log('\n🗺️  TRIP_PLANS:');
    const plansResult = await productionPool.query('SELECT COUNT(*) as count FROM trip_plans');
    console.log(`   Total: ${plansResult.rows[0].count} records`);
    
    if (parseInt(plansResult.rows[0].count) > 0) {
      const plansSample = await productionPool.query(`
        SELECT tp.id, tp.user_id, tp.service_id, tp.plan_date, u.email, s.title
        FROM trip_plans tp
        LEFT JOIN users u ON tp.user_id = u.id
        LEFT JOIN services s ON tp.service_id = s.id
        LIMIT 5
      `);
      console.log('   Sample:');
      plansSample.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. ${row.email} - ${row.title} (${row.plan_date})`);
      });
    }
    
    // Check bookings
    console.log('\n📅 BOOKINGS:');
    const bookingsResult = await productionPool.query('SELECT COUNT(*) as count FROM bookings');
    console.log(`   Total: ${bookingsResult.rows[0].count} records`);
    
    if (parseInt(bookingsResult.rows[0].count) > 0) {
      const bookingsSample = await productionPool.query(`
        SELECT b.id, b.traveler_id, b.service_id, b.status, u.email, s.title
        FROM bookings b
        LEFT JOIN users u ON b.traveler_id = u.id
        LEFT JOIN services s ON b.service_id = s.id
        LIMIT 5
      `);
      console.log('   Sample:');
      bookingsSample.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. ${row.email} - ${row.title} (${row.status})`);
      });
    }
    
    // Check users
    console.log('\n👥 USERS:');
    const usersResult = await productionPool.query(`
      SELECT COUNT(*) as count, user_type
      FROM users
      GROUP BY user_type
    `);
    console.log('   By type:');
    usersResult.rows.forEach(row => {
      console.log(`     ${row.user_type}: ${row.count}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('   This is the PRODUCTION database that Render backend uses');
    console.log('   If counts are 0, data is NOT being saved to production');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await productionPool.end();
  }
}

checkProductionDatabase();
