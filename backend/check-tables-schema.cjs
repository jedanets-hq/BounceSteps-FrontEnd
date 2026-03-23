require('dotenv').config({ path: __dirname + '/.env' });
const { pool } = require('./models');

async function checkSchema() {
  try {
    console.log('🔍 Checking provider_followers and favorites schema\n');
    
    // Check provider_followers columns
    console.log('1️⃣ provider_followers columns:');
    const pfColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'provider_followers'
      ORDER BY ordinal_position
    `);
    console.table(pfColumns.rows);
    
    // Check favorites columns
    console.log('\n2️⃣ favorites columns:');
    const favColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    console.table(favColumns.rows);
    
    // Check foreign keys
    console.log('\n3️⃣ Foreign keys:');
    const fks = await pool.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('provider_followers', 'favorites')
    `);
    console.table(fks.rows);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkSchema();
