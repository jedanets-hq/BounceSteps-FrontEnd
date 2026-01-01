const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 Checking if tables exist in database...\n');
    
    // Check for cart_items table
    const cartCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      );
    `);
    console.log('✅ cart_items table exists:', cartCheck.rows[0].exists);
    
    // Check for bookings table
    const bookingsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
      );
    `);
    console.log('✅ bookings table exists:', bookingsCheck.rows[0].exists);
    
    // Check for favorites table
    const favoritesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `);
    console.log('✅ favorites table exists:', favoritesCheck.rows[0].exists);
    
    // Check for trip_plans table
    const plansCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trip_plans'
      );
    `);
    console.log('✅ trip_plans table exists:', plansCheck.rows[0].exists);
    
    console.log('\n🔍 Checking data in tables...\n');
    
    // Count cart items
    if (cartCheck.rows[0].exists) {
      const cartCount = await pool.query('SELECT COUNT(*) FROM cart_items');
      console.log('📦 Cart items count:', cartCount.rows[0].count);
    }
    
    // Count bookings
    if (bookingsCheck.rows[0].exists) {
      const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
      console.log('📋 Bookings count:', bookingsCount.rows[0].count);
    }
    
    // Count favorites
    if (favoritesCheck.rows[0].exists) {
      const favoritesCount = await pool.query('SELECT COUNT(*) FROM favorites');
      console.log('❤️  Favorites count:', favoritesCount.rows[0].count);
    }
    
    // Count trip plans
    if (plansCheck.rows[0].exists) {
      const plansCount = await pool.query('SELECT COUNT(*) FROM trip_plans');
      console.log('🗺️  Trip plans count:', plansCount.rows[0].count);
    }
    
    await pool.end();
    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
