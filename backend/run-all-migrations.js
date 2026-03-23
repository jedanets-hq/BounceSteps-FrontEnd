const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '34.42.58.123',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bouncesteps-db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '@JedaNets01',
});

async function runSQLFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const client = await pool.connect();
  
  try {
    console.log(`\n📋 Running: ${path.basename(filePath)}`);
    await client.query(sql);
    console.log(`✅ Completed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error in ${path.basename(filePath)}:`, error.message);
  } finally {
    client.release();
  }
}

async function runAllMigrations() {
  console.log('🔧 Running all database migrations...\n');
  
  try {
    // Run SQL migrations in order
    const sqlMigrations = [
      'migrations/create-reviews-table.sql',
      'migrations/create-messages-table.sql',
      'migrations/create-provider-followers-table.sql',
      'migrations/add-service-favorites.sql',
      'migrations/add-service-featured-trending.sql',
      'migrations/add-payment-system.sql',
      'migrations/add-promotion-categories.sql',
      'migrations/create-admin-tables.sql',
    ];
    
    for (const migration of sqlMigrations) {
      const filePath = path.join(__dirname, migration);
      if (fs.existsSync(filePath)) {
        await runSQLFile(filePath);
      } else {
        console.log(`⚠️  Skipping ${migration} (file not found)`);
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAllMigrations();
