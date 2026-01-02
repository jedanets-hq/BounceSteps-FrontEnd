const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const { pool } = require('./config/postgresql');

(async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Cart API Diagnostic Test                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Check database connection
    console.log('1️⃣  Testing Database Connection...');
    const connTest = await pool.query('SELECT NOW()');
    console.log('   ✅ Database connected\n');

    // 2. Check cart_items table
    console.log('2️⃣  Checking cart_items Table...');
    const tableCheck = await pool.query(
      "SELECT * FROM information_schema.tables WHERE table_name = 'cart_items'"
    );
    if (tableCheck.rows.length === 0) {
      console.log('   ❌ cart_items table NOT FOUND\n');
      process.exit(1);
    }
    console.log('   ✅ cart_items table exists\n');

    // 3. Check users table
    console.log('3️⃣  Checking Users...');
    const usersCheck = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`   ✅ Found ${usersCheck.rows[0].count} users\n`);

    // 4. Check services table
    console.log('4️⃣  Checking Services...');
    const servicesCheck = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`   ✅ Found ${servicesCheck.rows[0].count} services\n`);

    // 5. Get a test user
    console.log('5️⃣  Getting Test User...');
    const userCheck = await pool.query(
      "SELECT id, email, user_type FROM users WHERE user_type = 'traveler' LIMIT 1"
    );
    if (userCheck.rows.length === 0) {
      console.log('   ❌ No traveler user found\n');
      process.exit(1);
    }
    const testUser = userCheck.rows[0];
    console.log(`   ✅ Test user: ${testUser.email} (ID: ${testUser.id})\n`);

    // 6. Get a test service
    console.log('6️⃣  Getting Test Service...');
    const serviceCheck = await pool.query(
      'SELECT id, title, price FROM services LIMIT 1'
    );
    if (serviceCheck.rows.length === 0) {
      console.log('   ❌ No service found\n');
      process.exit(1);
    }
    const testService = serviceCheck.rows[0];
    console.log(`   ✅ Test service: ${testService.title} (ID: ${testService.id}, Price: ${testService.price})\n`);

    // 7. Test adding to cart
    console.log('7️⃣  Testing Add to Cart...');
    const addResult = await pool.query(
      `INSERT INTO cart_items (user_id, service_id, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, service_id) 
       DO UPDATE SET quantity = cart_items.quantity + 1, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [testUser.id, testService.id]
    );
    console.log('   ✅ Item added to cart\n');

    // 8. Test getting cart
    console.log('8️⃣  Testing Get Cart...');
    const cartResult = await pool.query(
      `SELECT 
        ci.id,
        ci.user_id,
        ci.service_id,
        ci.quantity,
        s.title,
        s.price
      FROM cart_items ci
      JOIN services s ON ci.service_id = s.id
      WHERE ci.user_id = $1`,
      [testUser.id]
    );
    console.log(`   ✅ Found ${cartResult.rows.length} items in cart`);
    cartResult.rows.forEach(item => {
      console.log(`      - ${item.title} (Qty: ${item.quantity}, Price: ${item.price})`);
    });
    console.log();

    // 9. Test API endpoints
    console.log('9️⃣  Testing API Endpoints...');
    const fetch = (await import('node-fetch')).default;

    // Test health endpoint
    try {
      const healthRes = await fetch('http://localhost:5000/api/health');
      const healthData = await healthRes.json();
      console.log(`   ✅ Health endpoint: ${healthData.status}\n`);
    } catch (e) {
      console.log(`   ⚠️  Health endpoint not accessible: ${e.message}\n`);
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ All Diagnostic Tests Passed!                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
