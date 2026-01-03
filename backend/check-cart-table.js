const { pool } = require('./backend/config/postgresql');

(async () => {
  try {
    console.log('🔍 Checking cart_items table...\n');

    // Check if table exists
    const tableCheck = await pool.query(
      "SELECT * FROM information_schema.tables WHERE table_name = 'cart_items'"
    );

    if (tableCheck.rows.length === 0) {
      console.log('❌ cart_items table NOT FOUND');
      console.log('\n📋 Creating cart_items table...\n');

      // Create the table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          quantity INTEGER DEFAULT 1,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, service_id)
        )
      `);

      console.log('✅ cart_items table created successfully!\n');
    } else {
      console.log('✅ cart_items table EXISTS\n');

      // Show schema
      const schema = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cart_items' ORDER BY ordinal_position"
      );

      console.log('📊 Table Schema:');
      schema.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });

      // Show row count
      const count = await pool.query('SELECT COUNT(*) FROM cart_items');
      console.log(`\n📈 Total items in cart: ${count.rows[0].count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
