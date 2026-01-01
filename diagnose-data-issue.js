const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 DEEP DIAGNOSIS - Checking data persistence issue\n');
    
    // Get a test user
    const users = await pool.query('SELECT id, email, first_name FROM users LIMIT 1');
    if (users.rows.length === 0) {
      console.log('❌ No users found in database');
      await pool.end();
      return;
    }
    
    const testUser = users.rows[0];
    console.log('👤 Test user:', testUser.email, '(ID:', testUser.id, ')\n');
    
    // Check cart items for this user
    console.log('📦 CART ITEMS:');
    const cartItems = await pool.query(`
      SELECT ci.*, s.title as service_title 
      FROM cart_items ci 
      LEFT JOIN services s ON ci.service_id = s.id 
      WHERE ci.user_id = $1
    `, [testUser.id]);
    console.log('   Count:', cartItems.rows.length);
    if (cartItems.rows.length > 0) {
      console.log('   Items:', cartItems.rows.map(i => ({
        id: i.id,
        service: i.service_title,
        added: i.added_at
      })));
    }
    
    // Check bookings for this user
    console.log('\n📋 BOOKINGS:');
    const bookings = await pool.query(`
      SELECT b.*, s.title as service_title 
      FROM bookings b 
      LEFT JOIN services s ON b.service_id = s.id 
      WHERE b.traveler_id = $1
    `, [testUser.id]);
    console.log('   Count:', bookings.rows.length);
    if (bookings.rows.length > 0) {
      console.log('   Items:', bookings.rows.map(b => ({
        id: b.id,
        service: b.service_title,
        status: b.status,
        created: b.created_at
      })));
    } else {
      console.log('   ⚠️  NO BOOKINGS FOUND FOR THIS USER');
    }
    
    // Check favorites for this user
    console.log('\n❤️  FAVORITES:');
    const favorites = await pool.query(`
      SELECT f.*, sp.business_name 
      FROM favorites f 
      LEFT JOIN service_providers sp ON f.provider_id = sp.id 
      WHERE f.user_id = $1
    `, [testUser.id]);
    console.log('   Count:', favorites.rows.length);
    if (favorites.rows.length > 0) {
      console.log('   Items:', favorites.rows.map(f => ({
        id: f.id,
        provider: f.business_name,
        added: f.added_at
      })));
    } else {
      console.log('   ⚠️  NO FAVORITES FOUND FOR THIS USER');
    }
    
    // Check trip plans for this user
    console.log('\n🗺️  TRIP PLANS:');
    const plans = await pool.query(`
      SELECT tp.*, s.title as service_title 
      FROM trip_plans tp 
      LEFT JOIN services s ON tp.service_id = s.id 
      WHERE tp.user_id = $1
    `, [testUser.id]);
    console.log('   Count:', plans.rows.length);
    if (plans.rows.length > 0) {
      console.log('   Items:', plans.rows.map(p => ({
        id: p.id,
        service: p.service_title,
        date: p.plan_date,
        added: p.added_at
      })));
    } else {
      console.log('   ⚠️  NO TRIP PLANS FOUND FOR THIS USER');
    }
    
    // Check ALL cart items in database
    console.log('\n\n🔍 ALL CART ITEMS IN DATABASE:');
    const allCartItems = await pool.query(`
      SELECT ci.*, u.email, s.title as service_title 
      FROM cart_items ci 
      LEFT JOIN users u ON ci.user_id = u.id 
      LEFT JOIN services s ON ci.service_id = s.id 
      ORDER BY ci.added_at DESC 
      LIMIT 10
    `);
    console.log('   Total count:', allCartItems.rows.length);
    if (allCartItems.rows.length > 0) {
      console.log('   Recent items:');
      allCartItems.rows.forEach(item => {
        console.log(`     - User: ${item.email}, Service: ${item.service_title}, Added: ${item.added_at}`);
      });
    }
    
    // Check ALL bookings in database
    console.log('\n🔍 ALL BOOKINGS IN DATABASE:');
    const allBookings = await pool.query(`
      SELECT b.*, u.email, s.title as service_title 
      FROM bookings b 
      LEFT JOIN users u ON b.traveler_id = u.id 
      LEFT JOIN services s ON b.service_id = s.id 
      ORDER BY b.created_at DESC 
      LIMIT 10
    `);
    console.log('   Total count:', allBookings.rows.length);
    if (allBookings.rows.length > 0) {
      console.log('   Recent bookings:');
      allBookings.rows.forEach(booking => {
        console.log(`     - User: ${booking.email}, Service: ${booking.service_title}, Status: ${booking.status}, Created: ${booking.created_at}`);
      });
    } else {
      console.log('   ⚠️  NO BOOKINGS AT ALL IN DATABASE!');
    }
    
    await pool.end();
    console.log('\n✅ Diagnosis complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
