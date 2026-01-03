const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 Testing user login and cart flow\n');
    
    // Get a real user from database
    const users = await pool.query(`
      SELECT id, email, first_name, last_name, user_type, password 
      FROM users 
      WHERE user_type = 'traveler' 
      LIMIT 1
    `);
    
    if (users.rows.length === 0) {
      console.log('❌ No traveler users found');
      await pool.end();
      return;
    }
    
    const user = users.rows[0];
    console.log('👤 Test user:', user.email);
    console.log('   ID:', user.id);
    console.log('   Type:', user.user_type);
    console.log('   Name:', user.first_name, user.last_name);
    
    // Check cart items for this user
    console.log('\n📦 Checking cart items for user ID:', user.id);
    const cartItems = await pool.query(`
      SELECT ci.*, s.title as service_title 
      FROM cart_items ci 
      LEFT JOIN services s ON ci.service_id = s.id 
      WHERE ci.user_id = $1
    `, [user.id]);
    
    console.log('   Cart items found:', cartItems.rows.length);
    if (cartItems.rows.length > 0) {
      cartItems.rows.forEach(item => {
        console.log(`     - ${item.service_title} (qty: ${item.quantity})`);
      });
    } else {
      console.log('   ⚠️  No cart items for this user');
      
      // Let's add a test item
      console.log('\n➕ Adding test item to cart...');
      const services = await pool.query('SELECT id, title FROM services LIMIT 1');
      if (services.rows.length > 0) {
        const service = services.rows[0];
        await pool.query(`
          INSERT INTO cart_items (user_id, service_id, quantity)
          VALUES ($1, $2, 1)
          ON CONFLICT (user_id, service_id) DO NOTHING
        `, [user.id, service.id]);
        
        console.log('   ✅ Added:', service.title);
        
        // Check again
        const newCart = await pool.query(`
          SELECT ci.*, s.title as service_title 
          FROM cart_items ci 
          LEFT JOIN services s ON ci.service_id = s.id 
          WHERE ci.user_id = $1
        `, [user.id]);
        console.log('   New cart count:', newCart.rows.length);
      }
    }
    
    // Check bookings
    console.log('\n📋 Checking bookings for user ID:', user.id);
    const bookings = await pool.query(`
      SELECT b.*, s.title as service_title 
      FROM bookings b 
      LEFT JOIN services s ON b.service_id = s.id 
      WHERE b.traveler_id = $1
    `, [user.id]);
    
    console.log('   Bookings found:', bookings.rows.length);
    if (bookings.rows.length > 0) {
      bookings.rows.forEach(booking => {
        console.log(`     - ${booking.service_title} (status: ${booking.status})`);
      });
    } else {
      console.log('   ⚠️  No bookings for this user');
    }
    
    // Check favorites
    console.log('\n❤️  Checking favorites for user ID:', user.id);
    const favorites = await pool.query(`
      SELECT f.*, sp.business_name 
      FROM favorites f 
      LEFT JOIN service_providers sp ON f.provider_id = sp.id 
      WHERE f.user_id = $1
    `, [user.id]);
    
    console.log('   Favorites found:', favorites.rows.length);
    if (favorites.rows.length > 0) {
      favorites.rows.forEach(fav => {
        console.log(`     - ${fav.business_name}`);
      });
    } else {
      console.log('   ⚠️  No favorites for this user');
    }
    
    // Check trip plans
    console.log('\n🗺️  Checking trip plans for user ID:', user.id);
    const plans = await pool.query(`
      SELECT tp.*, s.title as service_title 
      FROM trip_plans tp 
      LEFT JOIN services s ON tp.service_id = s.id 
      WHERE tp.user_id = $1
    `, [user.id]);
    
    console.log('   Trip plans found:', plans.rows.length);
    if (plans.rows.length > 0) {
      plans.rows.forEach(plan => {
        console.log(`     - ${plan.service_title} (date: ${plan.plan_date})`);
      });
    } else {
      console.log('   ⚠️  No trip plans for this user');
    }
    
    console.log('\n\n📝 SUMMARY:');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Cart items:', cartItems.rows.length);
    console.log('   Bookings:', bookings.rows.length);
    console.log('   Favorites:', favorites.rows.length);
    console.log('   Trip plans:', plans.rows.length);
    
    console.log('\n💡 RECOMMENDATION:');
    console.log('   Login with:', user.email);
    console.log('   Password: 123456 (if using default test password)');
    console.log('   Then check dashboard to see if data appears');
    
    await pool.end();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
