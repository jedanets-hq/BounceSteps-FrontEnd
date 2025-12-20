const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'i_SAFARI_DATABASE',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('🔧 Running all migrations...\n');

    // Migration files to run in order
    const migrations = [
      'create_traveler_stories_tables.sql',
      'add_missing_columns.sql',
      'add_payment_contact_columns.sql'
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, 'migrations', migration);
      
      if (fs.existsSync(filePath)) {
        console.log(`📝 Running migration: ${migration}`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`✅ ${migration} completed\n`);
      } else {
        console.log(`⚠️ Migration file not found: ${migration}\n`);
      }
    }

    // Verify tables and columns
    console.log('📋 Verifying database structure...\n');

    // Check service_providers columns
    const spColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `);
    console.log('service_providers columns:');
    spColumns.rows.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));

    // Check traveler_stories columns
    const tsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'traveler_stories'
      ORDER BY ordinal_position
    `);
    console.log('\ntraveler_stories columns:');
    tsColumns.rows.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));

    // Check data counts
    console.log('\n📊 Data counts:');
    
    const tables = ['service_providers', 'traveler_stories', 'story_likes', 'story_comments'];
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`  ${table}: ${result.rows[0].count} records`);
      } catch (e) {
        console.log(`  ${table}: table does not exist`);
      }
    }

    console.log('\n🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
