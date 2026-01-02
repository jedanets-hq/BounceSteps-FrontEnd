const { pool } = require('./config/postgresql');

(async () => {
  try {
    console.log('🔍 Diagnosing Data Persistence Issues...\n');
    
    // Check cart_items table
    const cartResult = await pool.query('SELECT COUNT(*) as count FROM cart_items');
    console.log('📊 Cart Items Count:', cartResult.rows[0].count);
    
    // Check favorites table
    const favResult = await pool.query('SELECT COUNT(*) as count FROM favorites');
    console.log('📊 Favorites Count:', favResult.rows[0].count);
    
    // Check trip_plans table
    const plansResult = await pool.query('SELECT COUNT(*) as count FROM trip_plans');
    console.log('📊 Trip Plans Count:', plansResult.rows[0].count);
    
    // Check sample data with details
    console.log('\n📦 Sample Cart Items:');
    const sampleCart = await pool.query(`
      SELECT ci.*, s.title, s.price, u.email 
      FROM cart_items ci
      LEFT JOIN services s ON ci.service_id = s.id
      LEFT JOIN users u ON ci.user_id = u.id
      LIMIT 5
    `);
    console.log(sampleCart.rows);
    
    console.log('\n❤️  Sample Favorites:');
    const sampleFav = await pool.query(`
      SELECT f.*, sp.business_name, u.email 
      FROM favorites f
      LEFT JOIN service_providers sp ON f.provider_id = sp.id
      LEFT JOIN users u ON f.user_id = u.id
      LIMIT 5
    `);
    console.log(sampleFav.rows);
    
    console.log('\n🗺️  Sample Trip Plans:');
    const samplePlans = await pool.query(`
      SELECT tp.*, s.title, s.price, u.email 
      FROM trip_plans tp
      LEFT JOIN services s ON tp.service_id = s.id
      LEFT JOIN users u ON tp.user_id = u.id
      LIMIT 5
    `);
    console.log(samplePlans.rows);
    
    // Check if tables have proper structure
    console.log('\n🔧 Table Structures:');
    const cartSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
    `);
    console.log('Cart Items Columns:', cartSchema.rows);
    
    const favSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
    `);
    console.log('Favorites Columns:', favSchema.rows);
    
    const plansSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'trip_plans'
    `);
    console.log('Trip Plans Columns:', plansSchema.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
