const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 Testing favorites and trip plans\n');
    
    // Get test user
    const users = await pool.query(`
      SELECT id, email FROM users WHERE user_type = 'traveler' LIMIT 1
    `);
    
    if (users.rows.length === 0) {
      console.log('❌ No traveler found');
      await pool.end();
      return;
    }
    
    const user = users.rows[0];
    console.log('👤 User:', user.email, '(ID:', user.id, ')');
    
    // Get a test provider
    const providers = await pool.query(`
      SELECT id, business_name FROM service_providers LIMIT 1
    `);
    
    if (providers.rows.length === 0) {
      console.log('❌ No providers found');
      await pool.end();
      return;
    }
    
    const provider = providers.rows[0];
    console.log('🏢 Provider:', provider.business_name, '(ID:', provider.id, ')');
    
    // Add to favorites
    console.log('\n❤️  Adding to favorites...');
    await pool.query(`
      INSERT INTO favorites (user_id, provider_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, provider_id) DO NOTHING
    `, [user.id, provider.id]);
    
    console.log('   ✅ Added to favorites');
    
    // Verify favorites
    const favorites = await pool.query(`
      SELECT f.*, sp.business_name 
      FROM favorites f 
      LEFT JOIN service_providers sp ON f.provider_id = sp.id 
      WHERE f.user_id = $1
    `, [user.id]);
    
    console.log('   Favorites count:', favorites.rows.length);
    if (favorites.rows.length > 0) {
      favorites.rows.forEach(fav => {
        console.log(`     - ${fav.business_name}`);
      });
    }
    
    // Get a test service for trip plan
    const services = await pool.query(`
      SELECT id, title FROM services LIMIT 1
    `);
    
    if (services.rows.length === 0) {
      console.log('❌ No services found');
      await pool.end();
      return;
    }
    
    const service = services.rows[0];
    console.log('\n🎯 Service:', service.title, '(ID:', service.id, ')');
    
    // Add to trip plans
    console.log('\n🗺️  Adding to trip plans...');
    const planDate = new Date();
    planDate.setDate(planDate.getDate() + 7); // 7 days from now
    
    await pool.query(`
      INSERT INTO trip_plans (user_id, service_id, plan_date, notes)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, service_id) DO UPDATE 
      SET plan_date = $3, notes = $4
    `, [user.id, service.id, planDate.toISOString().split('T')[0], 'Test trip plan']);
    
    console.log('   ✅ Added to trip plans');
    
    // Verify trip plans
    const plans = await pool.query(`
      SELECT tp.*, s.title as service_title 
      FROM trip_plans tp 
      LEFT JOIN services s ON tp.service_id = s.id 
      WHERE tp.user_id = $1
    `, [user.id]);
    
    console.log('   Trip plans count:', plans.rows.length);
    if (plans.rows.length > 0) {
      plans.rows.forEach(plan => {
        console.log(`     - ${plan.service_title} (date: ${plan.plan_date})`);
      });
    }
    
    // Summary
    console.log('\n📊 SUMMARY for user:', user.email);
    const cart = await pool.query('SELECT COUNT(*) FROM cart_items WHERE user_id = $1', [user.id]);
    const bookings = await pool.query('SELECT COUNT(*) FROM bookings WHERE traveler_id = $1', [user.id]);
    const favs = await pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [user.id]);
    const tripPlans = await pool.query('SELECT COUNT(*) FROM trip_plans WHERE user_id = $1', [user.id]);
    
    console.log('   Cart items:', cart.rows[0].count);
    console.log('   Bookings:', bookings.rows[0].count);
    console.log('   Favorites:', favs.rows[0].count);
    console.log('   Trip plans:', tripPlans.rows[0].count);
    
    console.log('\n💡 Now login with:', user.email);
    console.log('   Password: 123456');
    console.log('   Check dashboard - all data should appear!');
    
    await pool.end();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
