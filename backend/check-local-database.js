const { Pool } = require('pg');

// Local database connection
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01',
});

async function checkLocalDatabase() {
  const client = await localPool.connect();
  
  try {
    console.log('🔍 Checking local database (isafari_db)...\n');
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No tables found in local database');
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} tables in local database:\n`);
    
    let totalRows = 0;
    const tablesWithData = [];
    
    for (const row of result.rows) {
      const tableName = row.table_name;
      
      // Get row count
      const rowResult = await client.query(`SELECT COUNT(*) as row_count FROM ${tableName}`);
      const rowCount = parseInt(rowResult.rows[0].row_count);
      totalRows += rowCount;
      
      if (rowCount > 0) {
        tablesWithData.push({ table: tableName, rows: rowCount });
      }
      
      console.log(`📋 ${tableName}: ${rowCount} rows`);
    }
    
    console.log(`\n📊 Total rows in local database: ${totalRows}`);
    
    if (tablesWithData.length > 0) {
      console.log(`\n✅ Tables with data (${tablesWithData.length}):`);
      tablesWithData.forEach(t => {
        console.log(`   - ${t.table}: ${t.rows} rows`);
      });
    } else {
      console.log('\n⚠️  No data found in local database');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to local database:', error.message);
    console.log('\n💡 This might mean:');
    console.log('   - Local PostgreSQL is not running');
    console.log('   - Database "isafari_db" does not exist locally');
    console.log('   - Connection credentials are incorrect');
  } finally {
    client.release();
    await localPool.end();
  }
}

checkLocalDatabase();
