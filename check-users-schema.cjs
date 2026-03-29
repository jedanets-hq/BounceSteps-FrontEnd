const { Pool } = require('./backend/node_modules/pg');

const productionPool = new Pool({
  connectionString: 'postgresql://isafarimasterorg_user:IuNv7yEfLRiDQL96cgmsxr2751MiBjsq@dpg-d5nhs5t6ubrc73asfksg-a.frankfurt-postgres.render.com/isafarimasterorg',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  console.log('🔍 CHECKING USERS TABLE SCHEMA\n');
  
  try {
    // Check users columns
    console.log('📋 USERS TABLE COLUMNS:');
    const usersColumns = await productionPool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    usersColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if is_active column exists
    const hasIsActive = usersColumns.rows.some(col => col.column_name === 'is_active');
    console.log(`\n❓ Has is_active column: ${hasIsActive}`);
    
    // Get sample user data
    console.log('\n👥 SAMPLE USER DATA:');
    const users = await productionPool.query(`
      SELECT * FROM users WHERE user_type = 'service_provider' LIMIT 3
    `);
    users.rows.forEach((u, idx) => {
      console.log(`\n   User ${idx + 1}:`);
      Object.keys(u).forEach(key => {
        console.log(`     ${key}: ${u[key]}`);
      });
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await productionPool.end();
  }
}

checkSchema();
