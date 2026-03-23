const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'isafari_db',
  user: 'postgres',
  password: '@Jctnftr01'
});

async function fixProviderBadgesTable() {
  try {
    console.log('🔧 Fixing provider_badges table...\n');
    
    // Make assigned_by nullable
    await pool.query(`
      ALTER TABLE provider_badges 
      ALTER COLUMN assigned_by DROP NOT NULL;
    `);
    
    console.log('✅ provider_badges table fixed - assigned_by is now nullable');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixProviderBadgesTable();
