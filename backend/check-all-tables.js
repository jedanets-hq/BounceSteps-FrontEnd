const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '34.42.58.123',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bouncesteps-db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@JedaNets01',
});

async function checkAllTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking all database tables...\n');
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${result.rows.length} tables:\n`);
    
    for (const row of result.rows) {
      const tableName = row.table_name;
      
      // Get column count
      const colResult = await client.query(`
        SELECT COUNT(*) as col_count 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [tableName]);
      
      // Get row count
      const rowResult = await client.query(`SELECT COUNT(*) as row_count FROM ${tableName}`);
      
      console.log(`📋 ${tableName}`);
      console.log(`   Columns: ${colResult.rows[0].col_count}`);
      console.log(`   Rows: ${rowResult.rows[0].row_count}\n`);
    }
    
    console.log('✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllTables();
