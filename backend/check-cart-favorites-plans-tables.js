const { pool } = require('./config/postgresql');

async function checkTables() {
  console.log('🔍 CHECKING CART, FAVORITES, AND PLANS TABLES\n');
  console.log('='.repeat(60));
  
  try {
    // Check if tables exist
    console.log('\n📋 Checking if tables exist...');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('cart_items', 'favorites', 'trip_plans')
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log('✅ Tables found:', tablesResult.rows.map(r => r.table_name).join(', '));
    
    // Check cart_items table
    console.log('\n📦 CART_ITEMS TABLE:');
    const cartCountResult = await pool.query('SELECT COUNT(*) as count FROM cart_items');
    console.log(`   Total records: ${cartCountResult.rows[0].count}`);
    
    if (parseInt(cartCountResult.rows[0].count) > 0) {
      const cartSampleResult = await pool.query(`
        SELECT ci.*, u.email, s.title
        FROM cart_items ci
        LEFT JOIN users u ON ci.user_id = u.id
        LEFT JOIN services s ON ci.service_id = s.id
        LIMIT 5
      `);
      console.log('   Sample records:');
      cartSampleResult.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. User: ${row.email}, Service: ${row.title}, Qty: ${row.quantity}`);
      });
    } else {
      console.log('   ⚠️  No cart items in database');
    }
    
    // Check favorites table
    console.log('\n❤️  FAVORITES TABLE:');
    const favCountResult = await pool.query('SELECT COUNT(*) as count FROM favorites');
    console.log(`   Total records: ${favCountResult.rows[0].count}`);
    
    if (parseInt(favCountResult.rows[0].count) > 0) {
      const favSampleResult = await pool.query(`
        SELECT f.*, u.email, sp.business_name
        FROM favorites f
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN service_providers sp ON f.provider_id = sp.id
        LIMIT 5
      `);
      console.log('   Sample records:');
      favSampleResult.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. User: ${row.email}, Provider: ${row.business_name}`);
      });
    } else {
      console.log('   ⚠️  No favorites in database');
    }
    
    // Check trip_plans table
    console.log('\n🗺️  TRIP_PLANS TABLE:');
    const plansCountResult = await pool.query('SELECT COUNT(*) as count FROM trip_plans');
    console.log(`   Total records: ${plansCountResult.rows[0].count}`);
    
    if (parseInt(plansCountResult.rows[0].count) > 0) {
      const plansSampleResult = await pool.query(`
        SELECT tp.*, u.email, s.title
        FROM trip_plans tp
        LEFT JOIN users u ON tp.user_id = u.id
        LEFT JOIN services s ON tp.service_id = s.id
        LIMIT 5
      `);
      console.log('   Sample records:');
      plansSampleResult.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. User: ${row.email}, Service: ${row.title}, Date: ${row.plan_date}`);
      });
    } else {
      console.log('   ⚠️  No trip plans in database');
    }
    
    // Check table structures
    console.log('\n🔧 TABLE STRUCTURES:');
    
    console.log('\n   cart_items columns:');
    const cartColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position
    `);
    cartColumnsResult.rows.forEach(col => {
      console.log(`     - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    console.log('\n   favorites columns:');
    const favColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    favColumnsResult.rows.forEach(col => {
      console.log(`     - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    console.log('\n   trip_plans columns:');
    const plansColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'trip_plans'
      ORDER BY ordinal_position
    `);
    plansColumnsResult.rows.forEach(col => {
      console.log(`     - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CHECK COMPLETE');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkTables();
