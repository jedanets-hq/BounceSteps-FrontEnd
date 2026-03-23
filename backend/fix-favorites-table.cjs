const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixFavoritesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 FIXING FAVORITES TABLE\n');
    
    await client.query('BEGIN');
    
    // Check current structure
    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'favorites'
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);
    console.log('Current columns:', existingColumns.join(', '));
    
    // Add service_id if missing
    if (!existingColumns.includes('service_id')) {
      console.log('\n❌ service_id column is MISSING');
      console.log('✅ Adding service_id column...');
      
      await client.query(`
        ALTER TABLE favorites 
        ADD COLUMN service_id INTEGER REFERENCES services(id) ON DELETE CASCADE
      `);
      
      console.log('   ✅ service_id column added');
    } else {
      console.log('\n✅ service_id column already exists');
    }
    
    // Drop old constraints if they exist
    const constraintsResult = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'favorites'
        AND constraint_type = 'UNIQUE'
    `);
    
    for (const row of constraintsResult.rows) {
      console.log(`   Dropping old constraint: ${row.constraint_name}`);
      await client.query(`
        ALTER TABLE favorites DROP CONSTRAINT IF EXISTS ${row.constraint_name}
      `);
    }
    
    // Add proper unique constraints
    console.log('\n✅ Adding unique constraints...');
    
    await client.query(`
      ALTER TABLE favorites 
      ADD CONSTRAINT favorites_user_service_unique 
      UNIQUE (user_id, service_id)
    `);
    console.log('   ✅ Added unique constraint on (user_id, service_id)');
    
    await client.query(`
      ALTER TABLE favorites 
      ADD CONSTRAINT favorites_user_provider_unique 
      UNIQUE (user_id, provider_id)
    `);
    console.log('   ✅ Added unique constraint on (user_id, provider_id)');
    
    await client.query('COMMIT');
    
    // Verify final structure
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('\n✅ FINAL FAVORITES TABLE STRUCTURE:');
    finalCheck.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ FAVORITES TABLE FIXED SUCCESSFULLY');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

fixFavoritesTable();
